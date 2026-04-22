import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Package, Tags, PoundSterling, Search, X, Plus, Upload, Loader, Trash2, Image as ImageIcon } from 'lucide-react';
import { PopupPanelField, PopupPanelTemplate } from '../components/ui/popup-panel';
import { readProducts, writeProducts } from '../lib/products-store';
import { deleteProductItem, listProductItems, upsertProductItem } from '../lib/firestore-products';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { app } from '../firebase';
import hoodieImageSrc from '../assets/hoodie.png';
import hoodieHoverImageSrc from '../assets/hoodie-hover.png';

const INITIAL_FORM = {
  title: '',
  slug: '',
  description: '',
  price: '',
  sizes: '',
  tags: '',
  colors: '[]',
  features: '',
  images: '[]',
};

const DELETE_CONFIRMATION_TEXT = 'DELETE';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value);
}

function getImageLabel(imageUrl, index) {
  if (!imageUrl) {
    return `Image ${index + 1}`;
  }

  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/').filter(Boolean);
    return decodeURIComponent(pathParts[pathParts.length - 1] || `Image ${index + 1}`);
  } catch (_error) {
    const pathParts = String(imageUrl).split('/').filter(Boolean);
    return decodeURIComponent(pathParts[pathParts.length - 1] || `Image ${index + 1}`);
  }
}

function getCleanImageName(image) {
  const source = image?.fullPath || image?.url || '';
  const sourceWithoutQuery = source.split('?')[0];
  const pathParts = sourceWithoutQuery.split('/').filter(Boolean);
  const rawFileName = decodeURIComponent(pathParts[pathParts.length - 1] || '');

  if (!rawFileName) {
    return getImageLabel(image?.url, 0);
  }

  const generatedPrefixMatch = rawFileName.match(/^\d{13}-[a-z0-9]+-(.+)$/i);
  return generatedPrefixMatch?.[1] || rawFileName;
}

function getFirestoreImageId(image) {
  try {
    const url = new URL(image?.url || '');
    return url.searchParams.get('token') || '';
  } catch (_error) {
    return '';
  }
}

export default function Admin() {
  const [query, setQuery] = useState('');
  const [catalogProducts, setCatalogProducts] = useState(() => readProducts());
  const [firestoreProducts, setFirestoreProducts] = useState([]);
  const [isLoadingFirestoreProducts, setIsLoadingFirestoreProducts] = useState(true);
  const [firestoreLoadError, setFirestoreLoadError] = useState('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingSlug, setEditingSlug] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#000000');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [storageImageLibrary, setStorageImageLibrary] = useState([]);
  const [isLoadingImageLibrary, setIsLoadingImageLibrary] = useState(false);
  const [libraryUploadFolder, setLibraryUploadFolder] = useState('library');
  const [isUploadingLibraryImages, setIsUploadingLibraryImages] = useState(false);
  const [libraryUploadProgress, setLibraryUploadProgress] = useState(0);
  const [deletingImageUrl, setDeletingImageUrl] = useState('');
  const [imageActionError, setImageActionError] = useState('');
  const fileInputRef = React.useRef(null);
  const libraryFileInputRef = React.useRef(null);

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
  const tagSummary = useMemo(() => {
    const counts = catalogProducts.reduce((accumulator, product) => {
      (product.tags || []).forEach((tag) => {
        const normalizedTag = tag.trim();
        if (!normalizedTag) {
          return;
        }

        accumulator[normalizedTag] = (accumulator[normalizedTag] || 0) + 1;
      });
      return accumulator;
    }, {});

    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  }, [catalogProducts]);
  const averagePrice = totalProducts
    ? catalogProducts.reduce((sum, product) => sum + Number(product.price || 0), 0) / totalProducts
    : 0;

  const firestoreImageLibrary = useMemo(() => {
    const imageMap = new Map();

    firestoreProducts.forEach((product) => {
      (product.images || []).forEach((imageUrl) => {
        if (!imageUrl || imageMap.has(imageUrl)) {
          return;
        }

        imageMap.set(imageUrl, {
          url: imageUrl,
          slug: product.slug || 'unknown-product',
          title: product.title || 'Untitled product',
        });
      });
    });

    return Array.from(imageMap.values());
  }, [firestoreProducts]);

  const selectableImageLibrary = useMemo(() => {
    const imageMap = new Map();

    [...firestoreImageLibrary, ...storageImageLibrary].forEach((image) => {
      if (!image?.url || imageMap.has(image.url)) {
        return;
      }

      imageMap.set(image.url, image);
    });

    return Array.from(imageMap.values());
  }, [firestoreImageLibrary, storageImageLibrary]);

  const allStorageImages = useMemo(() => {
    const imageMap = new Map();

    storageImageLibrary.forEach((image) => {
      if (!image?.url || imageMap.has(image.url)) {
        return;
      }

      imageMap.set(image.url, image);
    });

    return Array.from(imageMap.values());
  }, [storageImageLibrary]);

  const firestoreImageUsageMap = useMemo(() => {
    const usage = new Map();

    firestoreProducts.forEach((product) => {
      (product.images || []).forEach((imageUrl) => {
        if (!imageUrl) {
          return;
        }

        usage.set(imageUrl, (usage.get(imageUrl) || 0) + 1);
      });
    });

    return usage;
  }, [firestoreProducts]);

  async function refreshStorageImageLibrary() {
    setIsLoadingImageLibrary(true);

    try {
      const storage = getStorage(app);
      const rootRef = ref(storage, 'products');
      const collected = [];

      async function walk(folderRef) {
        const listing = await listAll(folderRef);

        for (const itemRef of listing.items) {
          if (!itemRef.fullPath.includes('/images/')) {
            continue;
          }

          const url = await getDownloadURL(itemRef);
          const parts = itemRef.fullPath.split('/');
          const productSlug = parts[1] || 'unknown-product';

          collected.push({
            url,
            slug: productSlug,
            title: itemRef.name,
            fullPath: itemRef.fullPath,
          });
        }

        for (const prefixRef of listing.prefixes) {
          await walk(prefixRef);
        }
      }

      await walk(rootRef);
      setStorageImageLibrary(collected);
    } catch (_error) {
      setStorageImageLibrary([]);
    } finally {
      setIsLoadingImageLibrary(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadProductsFromFirestore() {
      setIsLoadingFirestoreProducts(true);
      setFirestoreLoadError('');

      try {
        const products = await listProductItems();
        if (mounted) {
          setFirestoreProducts(products);
          setCatalogProducts(products.length > 0 ? products : readProducts());
        }
      } catch (error) {
        if (mounted) {
          setFirestoreProducts([]);
          setFirestoreLoadError(
            error instanceof Error
              ? error.message
              : 'Could not load product documents from Firestore.'
          );
        }
      } finally {
        if (mounted) {
          setIsLoadingFirestoreProducts(false);
        }
      }
    }

    loadProductsFromFirestore();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    writeProducts(catalogProducts);
  }, [catalogProducts]);

  useEffect(() => {
    refreshStorageImageLibrary();
  }, []);

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
      colors: JSON.stringify(product.colors || []),
      features: (product.features || []).join('\n'),
      images: JSON.stringify(product.images || []),
    });
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setFormError('');
    setDeleteConfirmation('');
    setNewColorName('');
    setNewColorHex('#000000');
    setNewImageUrl('');
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function handleRemoveTag(tagToRemove) {
    const normalizedTag = tagToRemove.trim();

    if (!normalizedTag) {
      return;
    }

    setCatalogProducts((current) => current.map((product) => ({
      ...product,
      tags: (product.tags || []).filter((tag) => tag !== normalizedTag),
    })));
  }

  function getEditingColors() {
    try {
      const parsed = JSON.parse(formData.colors);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function handleAddColor() {
    if (!newColorName.trim() || !newColorHex) {
      setFormError('Color name and hex value are required.');
      return;
    }

    const colors = getEditingColors();
    const newColor = { name: newColorName.trim(), hex: newColorHex };
    
    setFormData((prev) => ({
      ...prev,
      colors: JSON.stringify([...colors, newColor]),
    }));
    setNewColorName('');
    setNewColorHex('#000000');
    setFormError('');
  }

  function handleRemoveColor(colorHex) {
    const colors = getEditingColors();
    setFormData((prev) => ({
      ...prev,
      colors: JSON.stringify(colors.filter((c) => c.hex !== colorHex)),
    }));
  }

  function getEditingImages() {
    try {
      const parsed = JSON.parse(formData.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function handleAddImage() {
    if (!newImageUrl.trim()) {
      setFormError('Image URL is required.');
      return;
    }

    const images = getEditingImages();
    setFormData((prev) => ({
      ...prev,
      images: JSON.stringify([...images, newImageUrl.trim()]),
    }));
    setNewImageUrl('');
    setFormError('');
  }

  function handleRemoveImage(index) {
    const images = getEditingImages();
    setFormData((prev) => ({
      ...prev,
      images: JSON.stringify(images.filter((_, i) => i !== index)),
    }));
  }

  function handleChooseFirestoreImage(imageUrl) {
    const images = getEditingImages();
    if (images.includes(imageUrl)) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: JSON.stringify([...images, imageUrl]),
    }));
  }

  async function handleDeleteFirestoreImage(imageUrl) {
    if (!imageUrl) {
      return;
    }

    const confirmed = window.confirm(
      'Delete this image from product records? The file will also be removed from Firebase Storage when possible.'
    );

    if (!confirmed) {
      return;
    }

    setDeletingImageUrl(imageUrl);
    setImageActionError('');

    try {
      const productsWithImage = catalogProducts.filter((product) =>
        (product.images || []).includes(imageUrl)
      );

      if (productsWithImage.length > 0) {
        const updates = productsWithImage.map((product) => {
          const updatedProduct = {
            ...product,
            images: (product.images || []).filter((url) => url !== imageUrl),
          };

          return upsertProductItem(updatedProduct).then(() => updatedProduct);
        });

        const updatedProducts = await Promise.all(updates);
        const updatedBySlug = new Map(updatedProducts.map((product) => [product.slug, product]));

        setCatalogProducts((current) =>
          current.map((product) => updatedBySlug.get(product.slug) || product)
        );
        setFirestoreProducts((current) =>
          current.map((product) => updatedBySlug.get(product.slug) || product)
        );
      }

      const storage = getStorage(app);
      try {
        await deleteObject(ref(storage, imageUrl));
      } catch (_storageDeleteError) {
        // URL might not map to a Storage object or may already be deleted.
      }

      setStorageImageLibrary((current) => current.filter((image) => image.url !== imageUrl));

      setFormData((current) => {
        try {
          const parsed = JSON.parse(current.images);
          if (!Array.isArray(parsed) || !parsed.includes(imageUrl)) {
            return current;
          }

          return {
            ...current,
            images: JSON.stringify(parsed.filter((url) => url !== imageUrl)),
          };
        } catch {
          return current;
        }
      });
    } catch (error) {
      setImageActionError(
        error instanceof Error ? error.message : 'Failed to delete image from Firestore products.'
      );
    } finally {
      setDeletingImageUrl('');
    }
  }

  async function handleLibraryFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const normalizedFolder =
      libraryUploadFolder.trim().toLowerCase().replace(/\s+/g, '-') || 'library';

    setIsUploadingLibraryImages(true);
    setLibraryUploadProgress(0);
    setImageActionError('');

    try {
      const storage = getStorage(app);
      let uploadedCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) {
          continue;
        }

        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 9);
        const fileName = `products/${normalizedFolder}/images/${timestamp}-${randomId}-${file.name}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, file);
        uploadedCount += 1;
        setLibraryUploadProgress(((i + 1) / files.length) * 100);
      }

      if (uploadedCount === 0) {
        setImageActionError('No image files were uploaded.');
        return;
      }

      await refreshStorageImageLibrary();
    } catch (error) {
      setImageActionError(
        error instanceof Error ? error.message : 'Failed to upload image to Firebase Storage.'
      );
    } finally {
      setIsUploadingLibraryImages(false);
      setLibraryUploadProgress(0);
      if (libraryFileInputRef.current) {
        libraryFileInputRef.current.value = '';
      }
    }
  }

  async function handleUploadHoodieDefaults() {
    const normalizedSlug = formData.slug.trim().toLowerCase();
    if (!normalizedSlug) {
      setFormError('Enter a product slug before uploading hoodie images.');
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(0);
    setFormError('');

    try {
      const storage = getStorage(app);
      const images = getEditingImages();
      const defaults = [
        { src: hoodieImageSrc, name: 'hoodie.png' },
        { src: hoodieHoverImageSrc, name: 'hoodie-hover.png' },
      ];

      for (let i = 0; i < defaults.length; i++) {
        const item = defaults[i];
        const response = await fetch(item.src);
        const blob = await response.blob();
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(2, 9);
        const fileName = `products/${normalizedSlug}/images/${timestamp}-${randomId}-${item.name}`;
        const storageRef = ref(storage, fileName);

        await uploadBytes(storageRef, blob);
        const downloadUrl = await getDownloadURL(storageRef);
        images.push(downloadUrl);
        setUploadProgress(((i + 1) / defaults.length) * 100);
      }

      setFormData((prev) => ({
        ...prev,
        images: JSON.stringify(images),
      }));
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to upload hoodie images.');
    } finally {
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
  }

  async function handleFileUpload(event) {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const normalizedSlug = formData.slug.trim().toLowerCase();
    if (!normalizedSlug) {
      setFormError('Enter a product slug before uploading images.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsUploadingImage(true);
    setUploadProgress(0);
    setFormError('');

    try {
      const storage = getStorage(app);
      const images = getEditingImages();
      let uploadedCount = 0;
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          console.warn(`File "${file.name}" is not an image. Skipping.`);
          continue;
        }

        try {
          // Create unique filename with timestamp
          const timestamp = Date.now();
          const randomId = Math.random().toString(36).substring(2, 9);
          const fileName = `products/${normalizedSlug}/images/${timestamp}-${randomId}-${file.name}`;
          const storageRef = ref(storage, fileName);

          // Upload file
          console.log(`Uploading ${file.name}...`);
          await uploadBytes(storageRef, file);
          const downloadUrl = await getDownloadURL(storageRef);

          // Add to images
          images.push(downloadUrl);
          uploadedCount++;
          setUploadProgress(((i + 1) / files.length) * 100);
        } catch (fileError) {
          console.error(`Failed to upload ${file.name}:`, fileError);
          setFormError(
            `Failed to upload ${file.name}: ${
              fileError instanceof Error ? fileError.message : 'Unknown error'
            }`
          );
        }
      }

      if (uploadedCount === 0) {
        setFormError('No images were successfully uploaded.');
        setIsUploadingImage(false);
        setUploadProgress(0);
        return;
      }

      // Update form data with all images
      setFormData((prev) => ({
        ...prev,
        images: JSON.stringify(images),
      }));

      console.log(`Successfully uploaded ${uploadedCount} image(s)`);
      setIsUploadingImage(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : 'Unknown error. Check browser console for details.';
      setFormError(`Upload failed: ${errorMsg}`);
      setIsUploadingImage(false);
      setUploadProgress(0);
    }
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
      features: formData.features.split('\n').map((value) => value.trim()).filter(Boolean),
      colors: (() => {
        try {
          const parsed = JSON.parse(formData.colors);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })(),
      images: (() => {
        try {
          const parsed = JSON.parse(formData.images);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      })(),
    };

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingProduct && editingProduct.slug !== normalizedSlug) {
        await deleteProductItem(editingProduct.slug);
      }
      await upsertProductItem(updatedProduct);

      if (editingProduct) {
        setCatalogProducts((current) => current.map((product) => (
          product.slug === editingProduct.slug ? updatedProduct : product
        )));
        setFirestoreProducts((current) => current.map((product) => (
          product.slug === editingProduct.slug ? updatedProduct : product
        )));
      } else {
        setCatalogProducts((current) => [updatedProduct, ...current]);
        setFirestoreProducts((current) => [updatedProduct, ...current]);
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
      setFirestoreProducts((current) => current.filter((product) => product.slug !== editingProduct.slug));
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

        <section className="mt-8 bg-[#141414] border border-[#2C2C2C] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display text-2xl tracking-wider text-[#CBCBCB]">Tag inventory</h2>
              <p className="font-body text-sm text-[#8B8B8B] mt-1">
                Unique tags found across the catalog. Removing one clears it from every product.
              </p>
            </div>
            <div className="font-body text-sm text-[#8B8B8B] uppercase tracking-[0.15em]">
              {tagSummary.length} unique tags
            </div>
          </div>

          {tagSummary.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {tagSummary.map(({ tag, count }) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="group inline-flex items-center gap-2 rounded-full border border-[#3B3B3B] bg-[#0D0D0D] px-4 py-2 text-sm text-[#D4D4D4] transition-colors hover:border-[#8B8B8B] hover:text-white"
                  title={`Remove ${tag} from all products`}
                >
                  <span className="font-medium">{tag}</span>
                  <span className="text-xs text-[#8B8B8B] group-hover:text-[#D4D4D4]">{count}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#A0A0A0] group-hover:text-[#FFB3B3]">Remove</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-[#8B8B8B]">No tags are currently assigned to any products.</p>
          )}
        </section>

        <section className="mt-8 bg-[#141414] border border-[#2C2C2C] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#A0A0A0]" />
              <div>
                <h2 className="font-display text-2xl tracking-wider text-[#CBCBCB]">Firestore Images</h2>
                <p className="font-body text-sm text-[#8B8B8B] mt-1">
                  All images from Firebase Storage under products/*/images, including unassigned files.
                </p>
              </div>
            </div>

            <div className="font-body text-sm text-[#8B8B8B] uppercase tracking-[0.15em]">
              {allStorageImages.length} images
            </div>
          </div>

          <div className="mb-5 p-4 rounded border border-[#2C2C2C] bg-[#0D0D0D] space-y-3">
            <p className="font-body text-xs uppercase tracking-[0.14em] text-[#8B8B8B]">Upload to Image Library</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={libraryUploadFolder}
                onChange={(event) => setLibraryUploadFolder(event.target.value)}
                placeholder="Folder slug (e.g. hoodie or summer-drop)"
                className="flex-1 h-10 px-3 bg-[#141414] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
                disabled={isUploadingLibraryImages}
              />
              <button
                type="button"
                onClick={() => libraryFileInputRef.current?.click()}
                disabled={isUploadingLibraryImages}
                className="h-10 px-4 border border-[#2C2C2C] text-[#A0A0A0] hover:text-white hover:border-[#8B8B8B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {isUploadingLibraryImages ? 'Uploading...' : 'Upload Images'}
              </button>
            </div>

            <input
              ref={libraryFileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleLibraryFileUpload}
              className="hidden"
            />

            {isUploadingLibraryImages ? (
              <div className="w-full h-2 bg-[#1F1F1F] rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#8B8B8B] to-[#A0A0A0] transition-all"
                  style={{ width: `${libraryUploadProgress}%` }}
                />
              </div>
            ) : null}
          </div>

          {imageActionError ? (
            <p className="mb-4 font-body text-sm text-[#FF7A7A] p-3 bg-[#5C2B2B]/30 rounded border border-[#5C2B2B]">
              {imageActionError}
            </p>
          ) : null}

          {firestoreLoadError ? (
            <p className="mb-4 font-body text-sm text-[#FFB3B3] p-3 bg-[#5C2B2B]/30 rounded border border-[#5C2B2B]">
              Firestore unavailable: {firestoreLoadError}
            </p>
          ) : null}

          {isLoadingImageLibrary ? (
            <p className="font-body text-sm text-[#8B8B8B]">Loading all storage images...</p>
          ) : allStorageImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allStorageImages.map((image) => {
                const isDeletingThisImage = deletingImageUrl === image.url;
                const usageCount = firestoreImageUsageMap.get(image.url) || 0;
                const cleanImageName = getCleanImageName(image);
                const firestoreImageId = getFirestoreImageId(image);

                return (
                  <article
                    key={image.url}
                    className="border border-[#2C2C2C] bg-[#0D0D0D] p-3 rounded"
                  >
                    <div className="w-full h-36 rounded bg-[#1F1F1F] overflow-hidden mb-3">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    <p className="text-sm font-semibold text-[#D4D4D4] truncate">{cleanImageName}</p>
                    <p className="text-xs text-[#8B8B8B] truncate mt-1">{image.title}</p>
                    <p className="text-xs text-[#8B8B8B] truncate">{image.slug}</p>
                    {firestoreImageId ? (
                      <a
                        href={image.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-xs text-[#A9C8FF] hover:text-[#D6E6FF] underline truncate mt-1"
                        title={firestoreImageId}
                      >
                        {firestoreImageId}
                      </a>
                    ) : (
                      <p className="text-xs text-[#707070] truncate mt-1">No Firestore token on URL</p>
                    )}
                    <p className="text-xs mt-1 text-[#A0A0A0]">
                      {usageCount > 0
                        ? `Referenced by ${usageCount} product image ${usageCount === 1 ? 'entry' : 'entries'}`
                        : 'Not referenced in Firestore product images'}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleDeleteFirestoreImage(image.url)}
                      disabled={Boolean(deletingImageUrl)}
                      className="mt-3 w-full h-9 inline-flex items-center justify-center gap-2 border border-[#5C2B2B] text-[#FFB3B3] hover:text-[#FFD3D3] hover:border-[#FF7A7A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isDeletingThisImage ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete Image
                        </>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="font-body text-sm text-[#8B8B8B]">
              No images found in Firebase Storage products folders.
            </p>
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
          {/* BASIC INFORMATION */}
          <div className="space-y-1 pb-4 border-b border-[#2C2C2C]">
            <p className="font-display text-sm tracking-wider text-[#A0A0A0] uppercase">Basic Information</p>
          </div>

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

          <PopupPanelField label="Slug" hint="Used in product URLs, e.g. /products/hoodie. Lowercase, no spaces.">
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleFieldChange}
              placeholder="product-slug"
              className="w-full h-10 px-3 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
            />
          </PopupPanelField>

          <PopupPanelField label="Description" hint="Detailed product description. One line per description.">
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleFieldChange}
              placeholder="Write a short product description"
              className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm resize-y focus:outline-none focus:border-[#8B8B8B]"
            />
          </PopupPanelField>

          {/* PRICING & INVENTORY */}
          <div className="space-y-1 pb-4 pt-6 border-b border-[#2C2C2C]">
            <p className="font-display text-sm tracking-wider text-[#A0A0A0] uppercase">Pricing & Inventory</p>
          </div>

          <PopupPanelField label="Price" hint="GBP value without currency symbol. E.g. 19.99">
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

          <PopupPanelField label="Sizes" hint="Comma separated. E.g. XS, S, M, L, XL, 2XL">
            <input
              type="text"
              name="sizes"
              value={formData.sizes}
              onChange={handleFieldChange}
              placeholder="S, M, L"
              className="w-full h-10 px-3 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
            />
          </PopupPanelField>

          {/* VARIANTS */}
          <div className="space-y-1 pb-4 pt-6 border-b border-[#2C2C2C]">
            <p className="font-display text-sm tracking-wider text-[#A0A0A0] uppercase">Variants & Colors</p>
          </div>

          <PopupPanelField label="Available Colors" hint="Manage color options for this product.">
            <div className="space-y-3">
              {getEditingColors().length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {getEditingColors().map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => handleRemoveColor(color.hex)}
                      className="group inline-flex items-center gap-2 px-3 py-2 rounded border border-[#2C2C2C] hover:border-[#8B8B8B] transition-colors"
                    >
                      <div
                        className="w-5 h-5 rounded border border-[#3B3B3B]"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm text-[#D4D4D4]">{color.name}</span>
                      <X className="w-3 h-3 text-[#8B8B8B] group-hover:text-white" />
                    </button>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Color name (e.g. Navy Blue)"
                  className="flex-1 h-10 px-3 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-10 h-10 bg-[#0D0D0D] border border-[#2C2C2C] cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="h-10 px-3 bg-[#2C2C2C] text-[#A0A0A0] hover:text-white hover:bg-[#3B3B3B] transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </PopupPanelField>

          {/* PRODUCT FEATURES */}
          <div className="space-y-1 pb-4 pt-6 border-b border-[#2C2C2C]">
            <p className="font-display text-sm tracking-wider text-[#A0A0A0] uppercase">Product Features</p>
          </div>

          <PopupPanelField label="Features" hint="One feature per line. E.g. '100% Cotton fabric'">
            <textarea
              rows={3}
              name="features"
              value={formData.features}
              onChange={handleFieldChange}
              placeholder="Feature line 1&#10;Feature line 2&#10;Feature line 3"
              className="w-full px-3 py-2 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm resize-y focus:outline-none focus:border-[#8B8B8B]"
            />
          </PopupPanelField>

          {/* IMAGES */}
          <div className="space-y-1 pb-4 pt-6 border-b border-[#2C2C2C]">
            <p className="font-display text-sm tracking-wider text-[#A0A0A0] uppercase">Product Images</p>
          </div>

          <PopupPanelField label="Images" hint="Upload images or paste URLs. Uploaded images stored in Firebase Storage.">
            <div className="space-y-3">
              {isLoadingImageLibrary && (
                <p className="text-xs text-[#8B8B8B]">Loading images from Firebase Storage...</p>
              )}

              {selectableImageLibrary.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#8B8B8B]">Choose from Firestore + Storage</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto admin-panel-scrollbar pr-1">
                    {selectableImageLibrary.map((image) => {
                      const isSelected = getEditingImages().includes(image.url);

                      return (
                        <button
                          key={image.url}
                          type="button"
                          onClick={() => handleChooseFirestoreImage(image.url)}
                          className={`text-left rounded border p-2 transition-colors ${
                            isSelected
                              ? 'border-[#8B8B8B] bg-[#1F1F1F]'
                              : 'border-[#2C2C2C] bg-[#0D0D0D] hover:border-[#8B8B8B]'
                          }`}
                        >
                          <div className="w-full h-20 rounded bg-[#1F1F1F] overflow-hidden mb-2">
                            <img
                              src={image.url}
                              alt={image.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                          <p className="text-xs text-[#D4D4D4] truncate">{image.title}</p>
                          <p className="text-[11px] text-[#8B8B8B] truncate">{image.slug}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!isLoadingImageLibrary && selectableImageLibrary.length === 0 && (
                <p className="text-xs text-[#8B8B8B]">No images found in Firebase Storage yet.</p>
              )}

              {getEditingImages().length > 0 && (
                <div className="space-y-2">
                  {getEditingImages().map((image, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 rounded border border-[#2C2C2C] bg-[#0D0D0D] hover:border-[#3B3B3B] transition-colors group"
                    >
                      <div className="w-12 h-12 rounded bg-[#1F1F1F] flex-shrink-0 overflow-hidden">
                        <img
                          src={image.startsWith('src/assets/') ? `/${image}` : image}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#D4D4D4] truncate font-medium">{getImageLabel(image, idx)}</p>
                        <p className="text-xs text-[#8B8B8B] truncate">Image {idx + 1}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-2 text-[#8B8B8B] hover:text-white hover:bg-[#2C2C2C] rounded transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isUploadingImage && (
                <div className="p-3 rounded border border-[#3B3B3B] bg-[#0D0D0D]">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader className="w-4 h-4 text-[#A0A0A0] animate-spin" />
                    <p className="text-sm text-[#A0A0A0]">Uploading... {Math.round(uploadProgress)}%</p>
                  </div>
                  <div className="w-full h-2 bg-[#1F1F1F] rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#8B8B8B] to-[#A0A0A0] transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 flex-col sm:flex-row">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="src/assets/product.png or https://example.com/image.jpg"
                  className="flex-1 h-10 px-3 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
                  disabled={isUploadingImage}
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={isUploadingImage}
                  className="h-10 px-3 bg-[#2C2C2C] text-[#A0A0A0] hover:text-white hover:bg-[#3B3B3B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Add URL
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploadingImage}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="w-full h-10 px-3 border-2 border-dashed border-[#2C2C2C] text-[#A0A0A0] hover:text-white hover:border-[#8B8B8B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 rounded"
              >
                <Upload className="w-4 h-4" />
                {isUploadingImage ? 'Uploading...' : 'Upload from File Explorer'}
              </button>

              <button
                type="button"
                onClick={handleUploadHoodieDefaults}
                disabled={isUploadingImage}
                className="w-full h-10 px-3 border border-[#2C2C2C] text-[#A0A0A0] hover:text-white hover:border-[#8B8B8B] disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 rounded"
              >
                <Upload className="w-4 h-4" />
                {isUploadingImage ? 'Uploading...' : 'Upload Hoodie Default Images'}
              </button>
            </div>
          </PopupPanelField>

          {/* CATEGORIZATION */}
          <div className="space-y-1 pb-4 pt-6 border-b border-[#2C2C2C]">
            <p className="font-display text-sm tracking-wider text-[#A0A0A0] uppercase">Categorization</p>
          </div>

          <PopupPanelField label="Tags" hint="Comma separated. E.g. New, Bestseller, Limited Edition">
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleFieldChange}
              placeholder="New, Bestseller"
              className="w-full h-10 px-3 bg-[#0D0D0D] border border-[#2C2C2C] text-[#D4D4D4] font-body text-sm focus:outline-none focus:border-[#8B8B8B]"
            />
          </PopupPanelField>

          {editingProduct ? (
            <>
              <div className="space-y-1 pb-4 pt-6 border-b border-[#2C2C2C]">
                <p className="font-display text-sm tracking-wider text-[#A0A0A0] uppercase">Danger Zone</p>
              </div>
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
            </>
          ) : null}

          {formError && formError.includes('Upload failed') ? (
            <div className="p-3 rounded border border-[#3B3B3B] bg-[#1F1F1F] space-y-2">
              <p className="font-body text-xs text-[#8B8B8B] uppercase tracking-[0.1em]">Firebase Storage Setup</p>
              <p className="font-body text-xs text-[#A0A0A0]">
                To enable image uploads, ensure Firebase Storage is enabled in your Firebase console:
              </p>
              <ol className="font-body text-xs text-[#A0A0A0] space-y-1 list-decimal list-inside">
                <li>Visit: <span className="text-[#D4D4D4]">console.firebase.google.com</span></li>
                <li>Go to Storage tab → Click "Start"</li>
                <li>Set Security Rules (see browser console for current rules)</li>
                <li>Retry upload after rules are applied</li>
              </ol>
              <p className="font-body text-xs text-[#ADADAD] italic">
                Check browser console (F12) for detailed error logs.
              </p>
            </div>
          ) : null}

          {formError ? (
            <p className="font-body text-sm text-[#FF7A7A] p-3 bg-[#5C2B2B]/30 rounded border border-[#5C2B2B]">{formError}</p>
          ) : null}
        </PopupPanelTemplate>
      </div>
    </div>
  );
}