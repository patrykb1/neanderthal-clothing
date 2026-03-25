import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Package, Tags, PoundSterling, Search } from 'lucide-react';
import { PopupPanelField, PopupPanelTemplate } from '../components/ui/popup-panel';
import { readProducts, writeProducts } from '../lib/products-store';
import { createProductItem, deleteProductItem } from '../lib/firestore-products';

const INITIAL_FORM = {
  title: '',
  slug: '',
  description: '',
  price: '',
  sizes: '',
  tags: '',
};

const DELETE_CONFIRMATION_TEXT = 'DELETE';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value);
}

export default function Admin() {
  const [query, setQuery] = useState('');
  const [catalogProducts, setCatalogProducts] = useState(() => readProducts());
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) {
      return catalogProducts;
    }

    return catalogProducts.filter((product) => {
      return (
        product.title.toLowerCase().includes(search) ||
        product.slug.toLowerCase().includes(search)
      );
    });
  }, [query, catalogProducts]);

  const editingProduct = useMemo(() => {
    if (!editingSlug) {
      return null;
    }

    return catalogProducts.find((product) => product.slug === editingSlug) || null;
  }, [catalogProducts, editingSlug]);

  const totalProducts = catalogProducts.length;
  const totalTags = catalogProducts.reduce((count, product) => count + (product.tags?.length || 0), 0);
  const averagePrice = totalProducts
    ? catalogProducts.reduce((sum, product) => sum + Number(product.price || 0), 0) / totalProducts
    : 0;

  useEffect(() => {
    writeProducts(catalogProducts);
  }, [catalogProducts]);

  function openCreatePanel() {
    setEditingSlug(null);
    setFormError('');
    setDeleteConfirmation('');
    setFormData(INITIAL_FORM);
    setPanelOpen(true);
  }

  function openEditPanel(product) {
    setEditingSlug(product.slug);
    setFormError('');
    setDeleteConfirmation('');
    setFormData({
      title: product.title || '',
      slug: product.slug || '',
      description: product.description || '',
      price: String(product.price ?? ''),
      sizes: (product.sizes || []).join(', '),
      tags: (product.tags || []).join(', '),
    });
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setFormError('');
    setDeleteConfirmation('');
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmitPanel() {
    const normalizedSlug = formData.slug.trim().toLowerCase();
    const normalizedTitle = formData.title.trim();
    const parsedPrice = Number(formData.price);

    if (!normalizedTitle || !normalizedSlug) {
      setFormError('Title and slug are required.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setFormError('Price must be a valid number greater than or equal to 0.');
      return;
    }

    const slugAlreadyExists = catalogProducts.some((product) => {
      if (editingProduct && product.slug === editingProduct.slug) {
        return false;
      }

      return product.slug.toLowerCase() === normalizedSlug;
    });

    if (slugAlreadyExists) {
      setFormError('Slug already exists. Choose a unique slug.');
      return;
    }

    const updatedProduct = {
      ...(editingProduct || {}),
      title: normalizedTitle,
      slug: normalizedSlug,
      description: formData.description.trim(),
      price: parsedPrice,
      sizes: formData.sizes.split(',').map((value) => value.trim()).filter(Boolean),
      tags: formData.tags.split(',').map((value) => value.trim()).filter(Boolean),
      images: editingProduct?.images || [],
      features: editingProduct?.features || [],
      colors: editingProduct?.colors || [],
    };

    setIsSubmitting(true);
    setFormError('');

    try {
      if (!editingProduct) {
        await createProductItem(updatedProduct);
      }

      if (editingProduct) {
        setCatalogProducts((current) => current.map((product) => (
          product.slug === editingProduct.slug ? updatedProduct : product
        )));
      } else {
        setCatalogProducts((current) => [updatedProduct, ...current]);
      }

      closePanel();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create product in Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDeleteProduct() {
    if (!editingProduct) {
      return;
    }

    if (deleteConfirmation.trim().toUpperCase() !== DELETE_CONFIRMATION_TEXT) {
      setFormError('Type DELETE to confirm product deletion.');
      return;
    }

    setIsDeleting(true);
    setFormError('');

    try {
      await deleteProductItem(editingProduct.slug);
      setCatalogProducts((current) => current.filter((product) => product.slug !== editingProduct.slug));
      closePanel();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to delete product from Firestore.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <span className="font-body text-sm tracking-[0.3em] text-[#A0A0A0] uppercase">Control Panel</span>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wider mt-4 text-[#CBCBCB]">ADMIN</h1>
          <p className="font-body text-[#8B8B8B] mt-3 max-w-2xl">
            Manage catalog insights and review product records from one place.
          </p>
          <button
            type="button"
            onClick={openCreatePanel}
            className="mt-5 h-10 px-4 bg-[#D4D4D4] text-[#0D0D0D] font-body text-sm tracking-[0.08em] uppercase hover:bg-white transition-colors"
          >
            Add Product
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#141414] border border-[#2C2C2C] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs tracking-[0.2em] text-[#8B8B8B] uppercase">Products</span>
              <Package className="w-4 h-4 text-[#8B8B8B]" />
            </div>
            <p className="font-display text-3xl text-[#D4D4D4]">{totalProducts}</p>
          </div>

          <div className="bg-[#141414] border border-[#2C2C2C] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs tracking-[0.2em] text-[#8B8B8B] uppercase">Total Tags</span>
              <Tags className="w-4 h-4 text-[#8B8B8B]" />
            </div>
            <p className="font-display text-3xl text-[#D4D4D4]">{totalTags}</p>
          </div>

          <div className="bg-[#141414] border border-[#2C2C2C] p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs tracking-[0.2em] text-[#8B8B8B] uppercase">Avg Price</span>
              <PoundSterling className="w-4 h-4 text-[#8B8B8B]" />
            </div>
            <p className="font-display text-3xl text-[#D4D4D4]">{formatCurrency(averagePrice)}</p>
          </div>
        </section>

        <section className="bg-[#141414] border border-[#2C2C2C] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#A0A0A0]" />
              <h2 className="font-display text-2xl tracking-wider text-[#CBCBCB]">Catalog</h2>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#8B8B8B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or slug"
                className="w-full bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] pl-9 pr-3 py-2 font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-[#2C2C2C]">
                  <th className="text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-[#8B8B8B]">Product</th>
                  <th className="text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-[#8B8B8B]">Slug</th>
                  <th className="text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-[#8B8B8B]">Price</th>
                  <th className="text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-[#8B8B8B]">Sizes</th>
                  <th className="text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-[#8B8B8B]">Tags</th>
                  <th className="text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-[#8B8B8B]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.slug} className="border-b border-[#1F1F1F]">
                    <td className="py-3 px-2 font-body text-sm text-[#D4D4D4]">{product.title}</td>
                    <td className="py-3 px-2 font-body text-sm text-[#A0A0A0]">{product.slug}</td>
                    <td className="py-3 px-2 font-body text-sm text-[#D4D4D4]">{formatCurrency(product.price)}</td>
                    <td className="py-3 px-2 font-body text-sm text-[#A0A0A0]">{(product.sizes || []).join(', ')}</td>
                    <td className="py-3 px-2 font-body text-sm text-[#A0A0A0]">{(product.tags || []).join(', ')}</td>
                    <td className="py-3 px-2">
                      <button
                        type="button"
                        onClick={() => openEditPanel(product)}
                        className="h-8 px-3 border border-[#2C2C2C] text-[#A0A0A0] font-body text-xs tracking-[0.08em] uppercase hover:text-white hover:border-[#8B8B8B] transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <p className="font-body text-sm text-[#8B8B8B] mt-5">No products matched your search.</p>
          )}
        </section>

        <PopupPanelTemplate
          open={panelOpen}
          onOpenChange={setPanelOpen}
          title={editingProduct ? 'Edit Product' : 'Add Product'}
          description="Use this panel to create a new product or update an existing one."
          cancelLabel="Close"
          submitLabel="Save Product"
          destructiveLabel="Delete Product"
          onCancel={closePanel}
          onSubmit={handleSubmitPanel}
          onDestructive={editingProduct ? handleDeleteProduct : undefined}
          isDestructiveDisabled={editingProduct ? deleteConfirmation.trim().toUpperCase() !== DELETE_CONFIRMATION_TEXT : false}
          isSubmitting={isSubmitting}
          isDestructiveSubmitting={isDeleting}
        >
          <PopupPanelField label="Product Name" hint="Keep this short and descriptive.">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFieldChange}
              placeholder="Enter product name"
              className="w-full h-10 px-3 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
            />
          </PopupPanelField>

          <PopupPanelField label="Slug" hint="Used in product URLs, e.g. /products/hoodie.">
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleFieldChange}
              placeholder="product-slug"
              className="w-full h-10 px-3 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
            />
          </PopupPanelField>

          <PopupPanelField label="Price" hint="Use GBP value without currency symbol.">
            <input
              type="number"
              min="0"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleFieldChange}
              placeholder="19.99"
              className="w-full h-10 px-3 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
            />
          </PopupPanelField>

          <PopupPanelField label="Sizes" hint="Comma separated, e.g. S, M, L, XL.">
            <input
              type="text"
              name="sizes"
              value={formData.sizes}
              onChange={handleFieldChange}
              placeholder="S, M, L"
              className="w-full h-10 px-3 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
            />
          </PopupPanelField>

          <PopupPanelField label="Tags" hint="Comma separated, e.g. New, Bestseller.">
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleFieldChange}
              placeholder="New, Bestseller"
              className="w-full h-10 px-3 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
            />
          </PopupPanelField>

          <PopupPanelField label="Description">
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleFieldChange}
              placeholder="Write a short product description"
              className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm resize-y focus:outline-none focus:border-[#8B8B8B]"
            />
          </PopupPanelField>

          {editingProduct ? (
            <PopupPanelField label="Delete Confirmation" hint="Type DELETE to enable the delete button.">
              <input
                type="text"
                name="deleteConfirmation"
                value={deleteConfirmation}
                onChange={(event) => setDeleteConfirmation(event.target.value)}
                placeholder="DELETE"
                className="w-full h-10 px-3 bg-[#0D0D0D] border border-[#5C2B2B] text-[#FFB3B3] font-body text-sm focus:outline-none focus:border-[#FF7A7A]"
              />
            </PopupPanelField>
          ) : null}

          {formError ? (
            <p className="font-body text-sm text-[#FF7A7A]">{formError}</p>
          ) : null}
        </PopupPanelTemplate>
      </div>
    </div>
  );
}