import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Package, Tags, PoundSterling, Search, X, Plus, Upload, Loader, Trash2, Image as ImageIcon } from 'lucide-react';
import { PopupPanelField, PopupPanelTemplate } from '../components/ui/popup-panel';
import { readProducts, writeProducts } from '../lib/products-store';
import { deleteProductItem, listProductItems, upsertProductItem } from '../lib/firestore-products';
import { getStorage, ref, uploadBytes, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
import { app } from '../firebase';
import { normalizeHexColor } from '../lib/theme-accent';
import { getFeaturedSlugs, toggleFeaturedSlug } from '../lib/featured-store';
import hoodieImageSrc from '../assets/neanderthalhoodies/Neanderthal-Clothing-0001.jpg';
import hoodieHoverImageSrc from '../assets/neanderthalhoodies/Neanderthal-Clothing-0002.jpg';

const INITIAL_FORM = {
  title: '',
  slug: '',
  description: '',
  price: '',
  accentColor: '',
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

function getStorageFullPathFromDownloadUrl(downloadUrl) {
  try {
    const url = new URL(downloadUrl);
    // Firebase download URL often contains '/o/<encodedPath>' in the pathname
    const match = url.pathname.match(/\/o\/(.+)$/);
    if (match && match[1]) {
      return decodeURIComponent(match[1]);
    }

    // Fallback: some URLs include a `name` or `o` query param
    const nameParam = url.searchParams.get('name') || url.searchParams.get('o');
    if (nameParam) return decodeURIComponent(nameParam);

    return '';
  } catch {
    return '';
  }
}

export default function Admin() {
  const [query, setQuery] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(0);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('admin-auth') === 'true';
  });
  
  useEffect(() => {
    let mounted = true;
    fetch('/api/admin-check')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setIsAdminAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);
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
  const [isUploadingLibraryImages, setIsUploadingLibraryImages] = useState(false);
  const [libraryUploadProgress, setLibraryUploadProgress] = useState(0);
  const [deletingImageUrl, setDeletingImageUrl] = useState('');
  const [imageActionError, setImageActionError] = useState('');
  const [featuredSlugs, setFeaturedSlugs] = useState(() => getFeaturedSlugs());
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

  useEffect(() => {
    setFeaturedSlugs(getFeaturedSlugs());
  }, []);

  function handleToggleFeatured(slug) {
    const next = toggleFeaturedSlug(slug);
    if (next.length === featuredSlugs.length && !featuredSlugs.includes(slug)) {
      // limit reached
      alert('You can only feature up to 4 products. Remove one before adding another.');
      return;
    }

    setFeaturedSlugs(next);
  }

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

  function handleAccentPreviewChange(event) {
    // removed: accent color preview
  }

  function handleAdminLogin(event) {
    event.preventDefault();

    if (Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setAdminError(`Too many attempts. Try again in ${remainingSeconds}s`);
      return;
    }
    // Send password to server for verification (server keeps secret)
    (async () => {
      try {
        const resp = await fetch('/api/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: adminPassword }),
        });

        if (resp.ok) {
          setIsAdminAuthenticated(true);
          setAdminError('');
          setFailedAttempts(0);
          setLockoutUntil(0);
          setAdminPassword('');
          return;
        }

        const body = await resp.json().catch(() => ({}));
        const nextFailedAttempts = failedAttempts + 1;
        setFailedAttempts(nextFailedAttempts);

        if (nextFailedAttempts >= 5) {
          const timeoutMs = 60_000;
          setLockoutUntil(Date.now() + timeoutMs);
          setAdminError('Too many incorrect attempts. Please wait 1 minute.');
          return;
        }

        setAdminError(body.error || `Incorrect password (${nextFailedAttempts}/5)`);
      } catch (error) {
        setAdminError(error instanceof Error ? error.message : 'Network error');
      }
    })();
  }

  function handleAdminLogout() {
    // notify server to clear auth cookie
    fetch('/api/admin-logout', { method: 'POST' }).catch(() => {});
    setIsAdminAuthenticated(false);
    setAdminPassword('');
    setAdminError('');
    setFailedAttempts(0);
    setLockoutUntil(0);
  }

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
      accentColor: product.accentColor || ((product.colors && product.colors[0] && product.colors[0].hex) || ''),
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

  const fallbackAccentColor = (() => {
    try {
      const parsed = JSON.parse(formData.colors);
      if (Array.isArray(parsed) && parsed[0] && parsed[0].hex) return parsed[0].hex;
    } catch {}
    return '#000000';
  })();

  const resolvedAccentColor = normalizeHexColor(formData.accentColor || fallbackAccentColor);

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
    const newColor = { name: newColorName.trim(), hex: newColorHex, image: null };
    
    setFormData((prev) => ({
      ...prev,
      colors: JSON.stringify([...colors, newColor]),
    }));
    setNewColorName('');
    setNewColorHex('#000000');
    setFormError('');
  }

  function handleSetColorImage(colorHex, imageUrl) {
    const colors = getEditingColors();
    const next = colors.map((c) => (c.hex === colorHex ? { ...c, image: imageUrl || null } : c));
    setFormData((prev) => ({ ...prev, colors: JSON.stringify(next) }));
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
        // Prefer a stored fullPath when available
        const libraryEntry = storageImageLibrary.find((img) => img.url === imageUrl && img.fullPath);
        const fullPath = libraryEntry?.fullPath || getStorageFullPathFromDownloadUrl(imageUrl);

        if (fullPath) {
          await deleteObject(ref(storage, fullPath));
        }
        // If we couldn't derive a fullPath, skip deleting from Storage (may be a public URL)
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

    const normalizedFolder = 'library';

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
      accentColor: resolvedAccentColor,
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

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-very-dark px-4">
        <form
          onSubmit={handleAdminLogin}
          className="w-full max-w-sm rounded-lg border border-brand-rust bg-brand-very-dark/80 p-6 shadow-lg"
        >
          <h1 className="font-display text-2xl tracking-wider text-brand-light-gray">ADMIN ACCESS</h1>
          <p className="mt-2 font-body text-sm text-brand-dark-gray">Enter the admin password to continue.</p>
          <input
            type="password"
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
            placeholder="Password"
            className="mt-4 w-full rounded border border-brand-rust bg-transparent px-3 py-2 font-body text-brand-light-gray outline-none"
          />
          {adminError ? <p className="mt-2 font-body text-sm text-red-400">{adminError}</p> : null}
          <button
            type="submit"
            className="mt-4 w-full bg-brand-light-gray px-3 py-2 font-body text-sm uppercase tracking-[0.08em] text-brand-very-dark transition-colors hover:bg-white"
          >
            Enter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-very-dark py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10">
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={handleAdminLogout}
              className="font-body text-sm uppercase tracking-[0.08em] text-brand-stone hover:text-white"
            >
              Log out
            </button>
          </div>
          <span className="font-body text-sm tracking-[0.3em] text-brand-stone uppercase">Control Panel</span>
          <h1 className="font-display text-4xl sm:text-5xl tracking-wider mt-4 text-brand-light-gray">ADMIN</h1>
          <p className="font-body text-brand-dark-gray mt-3 max-w-2xl">
            Manage catalog insights and review product records from one place.
          </p>
          <button
            type="button"
            onClick={openCreatePanel}
            className="mt-5 h-10 px-4 bg-brand-light-gray text-brand-very-dark font-body text-sm tracking-[0.08em] uppercase hover:bg-white transition-colors"
          >
            Add Product
          </button>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">

          <div className="bg-brand-very-dark border border-brand-rust p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs tracking-[0.2em] text-brand-dark-gray uppercase">Products</span>
              <Package className="w-4 h-4 text-brand-dark-gray" />
            </div>
            <p className="font-display text-3xl text-brand-light-gray">{totalProducts}</p>
          </div>

          <div className="bg-brand-very-dark border border-brand-rust p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs tracking-[0.2em] text-brand-dark-gray uppercase">Total Tags</span>
              <Tags className="w-4 h-4 text-brand-dark-gray" />
            </div>
            <p className="font-display text-3xl text-brand-light-gray">{totalTags}</p>
          </div>

          <div className="bg-brand-very-dark border border-brand-rust p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="font-body text-xs tracking-[0.2em] text-brand-dark-gray uppercase">Avg Price</span>
              <PoundSterling className="w-4 h-4 text-brand-dark-gray" />
            </div>
            <p className="font-display text-3xl text-brand-light-gray">{formatCurrency(averagePrice)}</p>
          </div>
        </section>

        <section className="bg-brand-very-dark border border-brand-rust p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-stone" />
              <h2 className="font-display text-2xl tracking-wider text-brand-light-gray">Catalog</h2>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-brand-dark-gray absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by title or slug"
                className="w-full bg-brand-dark border border-brand-rust text-brand-light-gray pl-9 pr-3 py-2 font-body text-sm focus:outline-none focus:border-brand-dark-gray"
              />
            </div>
          </div>

          <div className="space-y-4 md:hidden">
            {filteredProducts.map((product) => (
              <div key={product.slug} className="border border-brand-rust bg-brand-dark p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display text-lg tracking-wider text-brand-light-gray truncate">{product.title}</p>
                    <p className="font-body text-xs tracking-[0.12em] uppercase text-brand-dark-gray truncate">{product.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleFeatured(product.slug)}
                      title="Feature this product"
                      className={`w-9 h-9 rounded-full flex items-center justify-center border ${featuredSlugs.includes(product.slug) ? 'bg-brand-stone text-black border-transparent' : 'bg-brand-dark border-brand-rust text-brand-stone'} transition-colors`}
                    >
                      ★
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditPanel(product)}
                      className="shrink-0 h-8 px-3 border border-brand-rust text-brand-stone font-body text-xs tracking-[0.08em] uppercase hover:text-white hover:border-brand-dark-gray transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-body text-xs tracking-widest uppercase text-brand-dark-gray">Price</p>
                    <p className="mt-1 text-brand-light-gray">{formatCurrency(product.price)}</p>
                  </div>
                  <div>
                    <p className="font-body text-xs tracking-widest uppercase text-brand-dark-gray">Sizes</p>
                    <p className="mt-1 text-brand-stone break-words">{(product.sizes || []).join(', ') || 'None'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-body text-xs tracking-widest uppercase text-brand-dark-gray">Tags</p>
                    <p className="mt-1 text-brand-stone break-words">{(product.tags || []).join(', ') || 'None'}</p>
                  </div>
                </div>
              </div>
            ))}

            {filteredProducts.length === 0 && (
              <p className="font-body text-sm text-brand-dark-gray mt-5">No products matched your search.</p>
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b border-brand-rust">
                  <th className="w-[22%] text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-brand-dark-gray">Product</th>
                  <th className="w-[20%] text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-brand-dark-gray">Slug</th>
                  <th className="w-[12%] text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-brand-dark-gray">Price</th>
                  <th className="w-[18%] text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-brand-dark-gray">Sizes</th>
                  <th className="w-[20%] text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-brand-dark-gray">Tags</th>
                  <th className="w-[8%] text-left py-3 px-2 font-body text-xs tracking-widest uppercase text-brand-dark-gray">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.slug} className="border-b border-brand-very-dark">
                    <td className="py-3 px-2 font-body text-sm text-brand-light-gray break-words">{product.title}</td>
                    <td className="py-3 px-2 font-body text-sm text-brand-stone break-all">{product.slug}</td>
                    <td className="py-3 px-2 font-body text-sm text-brand-light-gray whitespace-nowrap">{formatCurrency(product.price)}</td>
                    <td className="py-3 px-2 font-body text-sm text-brand-stone break-words">{(product.sizes || []).join(', ')}</td>
                    <td className="py-3 px-2 font-body text-sm text-brand-stone break-words">{(product.tags || []).join(', ')}</td>
                    <td className="py-3 px-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(product.slug)}
                        title="Feature this product"
                        className={`w-9 h-9 rounded-full flex items-center justify-center border ${featuredSlugs.includes(product.slug) ? 'bg-brand-stone text-black border-transparent' : 'bg-brand-dark border-brand-rust text-brand-stone'} transition-colors`}
                      >
                        ★
                      </button>
                      <button
                        type="button"
                        onClick={() => openEditPanel(product)}
                        className="h-8 px-3 border border-brand-rust text-brand-stone font-body text-xs tracking-[0.08em] uppercase hover:text-white hover:border-brand-dark-gray transition-colors"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-8 bg-brand-very-dark border border-brand-rust p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="font-display text-2xl tracking-wider text-brand-light-gray">Tag inventory</h2>
              <p className="font-body text-sm text-brand-dark-gray mt-1">
                Unique tags found across the catalog. Removing one clears it from every product.
              </p>
            </div>
            <div className="font-body text-sm text-brand-dark-gray uppercase tracking-[0.15em]">
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
                  className="group inline-flex items-center gap-2 rounded-full border border-brand-rust bg-brand-dark px-4 py-2 text-sm text-brand-light-gray transition-colors hover:border-brand-dark-gray hover:text-white"
                  title={`Remove ${tag} from all products`}
                >
                  <span className="font-medium">{tag}</span>
                  <span className="text-xs text-brand-dark-gray group-hover:text-brand-light-gray">{count}</span>
                  <span className="text-xs uppercase tracking-[0.2em] text-brand-stone group-hover:text-red-400">Remove</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="font-body text-sm text-brand-dark-gray">No tags are currently assigned to any products.</p>
          )}
        </section>

        <section className="mt-8 bg-brand-forest border border-brand-brown p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-brand-stone" />
              <div>
                <h2 className="font-display text-2xl tracking-wider text-brand-light-gray">Firestore Images</h2>
                <p className="font-body text-sm text-brand-dark-gray mt-1">
                  All images from Firebase Storage, including unassigned files.
                </p>
              </div>
            </div>

            <div className="font-body text-sm text-brand-dark-gray uppercase tracking-[0.15em]">
              {allStorageImages.length} images
            </div>
          </div>

          <div className="mb-5 p-4 rounded border border-brand-rust bg-brand-dark space-y-3">
            <p className="font-body text-xs uppercase tracking-[0.14em] text-brand-dark-gray">Upload to Image Library</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => libraryFileInputRef.current?.click()}
                disabled={isUploadingLibraryImages}
                className="h-10 px-4 border border-brand-rust text-brand-stone hover:text-white hover:border-brand-dark-gray disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2"
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
              <div className="w-full h-2 bg-brand-very-dark rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-dark-gray to-brand-stone transition-all"
                  style={{ width: `${libraryUploadProgress}%` }}
                />
              </div>
            ) : null}
          </div>

          {imageActionError ? (
            <p className="mb-4 font-body text-sm text-red-400 p-3 bg-red-900/20 rounded border border-red-900">
              {imageActionError}
            </p>
          ) : null}

          {firestoreLoadError ? (
            <p className="mb-4 font-body text-sm text-red-300 p-3 bg-red-900/20 rounded border border-red-900">
              Firestore unavailable: {firestoreLoadError}
            </p>
          ) : null}

          {isLoadingImageLibrary ? (
            <p className="font-body text-sm text-brand-dark-gray">Loading all storage images...</p>
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
                    className="border border-brand-rust bg-brand-dark p-3 rounded"
                  >
                    <div className="w-full h-36 rounded bg-brand-forest overflow-hidden mb-3">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>

                    <p className="text-sm font-semibold text-brand-light-gray truncate">{cleanImageName}</p>
                    <p className="text-xs text-brand-dark-gray truncate mt-1">{image.title}</p>
                    <p className="text-xs text-brand-dark-gray truncate">{image.slug}</p>
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
                    <p className="text-xs mt-1 text-brand-stone">
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
            <p className="font-body text-sm text-brand-dark-gray">
              No images found in Firebase Storage.
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
          <div className="space-y-1 pb-4 border-b border-brand-brown">
            <p className="font-display text-sm tracking-wider text-brand-stone uppercase">Basic Information</p>
          </div>

          <PopupPanelField label="Product Name" hint="Keep this short and descriptive.">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleFieldChange}
              placeholder="Enter product name"
              className="w-full h-10 px-3 bg-brand-very-dark border border-brand-brown text-brand-light-gray font-body text-sm focus:outline-none focus:border-brand-dark-gray"
            />
          </PopupPanelField>

          <PopupPanelField label="Slug" hint="Used in product URLs, e.g. /products/hoodie. Lowercase, no spaces.">
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleFieldChange}
              placeholder="product-slug"
              className="w-full h-10 px-3 bg-brand-very-dark border border-brand-brown text-brand-light-gray font-body text-sm focus:outline-none focus:border-brand-dark-gray"
            />
          </PopupPanelField>

          <PopupPanelField label="Description" hint="Detailed product description. One line per description.">
            <textarea
              rows={4}
              name="description"
              value={formData.description}
              onChange={handleFieldChange}
              placeholder="Write a short product description"
              className="w-full px-3 py-2 bg-brand-very-dark border border-brand-brown text-brand-light-gray font-body text-sm resize-y focus:outline-none focus:border-brand-dark-gray"
            />
          </PopupPanelField>

          {/* PRICING & INVENTORY */}
          <div className="space-y-1 pb-4 pt-6 border-b border-brand-brown">
            <p className="font-display text-sm tracking-wider text-brand-stone uppercase">Pricing & Inventory</p>
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
              className="w-full h-10 px-3 bg-brand-very-dark border border-brand-brown text-brand-light-gray font-body text-sm focus:outline-none focus:border-brand-dark-gray"
            />
          </PopupPanelField>

          <PopupPanelField label="Sizes" hint="Comma separated. E.g. XS, S, M, L, XL, 2XL">
            <input
              type="text"
              name="sizes"
              value={formData.sizes}
              onChange={handleFieldChange}
              placeholder="S, M, L"
              className="w-full h-10 px-3 bg-brand-very-dark border border-brand-brown text-brand-light-gray font-body text-sm focus:outline-none focus:border-brand-dark-gray"
            />
          </PopupPanelField>

          {/* VARIANTS */}
          <div className="space-y-1 pb-4 pt-6 border-b border-brand-brown">
            <p className="font-display text-sm tracking-wider text-brand-stone uppercase">Variants & Colors</p>
          </div>

          <PopupPanelField label="Available Colors" hint="Manage color options for this product.">
            <div className="space-y-3">
              {getEditingColors().length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {getEditingColors().map((color) => (
                    <div key={color.hex} className="p-2 rounded border border-brand-brown bg-brand-very-dark flex items-center gap-3">
                      <div className="w-5 h-5 rounded border border-brand-rust" style={{ backgroundColor: color.hex }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-brand-light-gray truncate">{color.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveColor(color.hex)}
                            className="p-1 text-brand-dark-gray hover:text-white hover:bg-brand-brown rounded transition-colors"
                            title="Remove color"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <label className="text-xs text-brand-dark-gray">Link image:</label>
                          <select
                            value={color.image || ''}
                            onChange={(e) => handleSetColorImage(color.hex, e.target.value || null)}
                            className="bg-brand-dark border border-brand-rust text-brand-light-gray text-xs px-2 py-1"
                          >
                            <option value="">None</option>
                            {getEditingImages().map((imgUrl, idx) => (
                              <option key={idx} value={imgUrl}>{getImageLabel(imgUrl, idx)}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Color name (e.g. Navy Blue)"
                  className="flex-1 h-10 px-3 bg-brand-very-dark border border-brand-brown text-brand-light-gray font-body text-sm focus:outline-none focus:border-brand-dark-gray"
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-10 h-10 bg-brand-very-dark border border-brand-brown cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="h-10 px-3 bg-brand-brown text-brand-stone hover:text-white hover:bg-brand-rust transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </PopupPanelField>

          {/* PRODUCT FEATURES */}
          <div className="space-y-1 pb-4 pt-6 border-b border-brand-brown">
            <p className="font-display text-sm tracking-wider text-brand-stone uppercase">Product Features</p>
          </div>

          <PopupPanelField label="Features" hint="One feature per line. E.g. '100% Cotton fabric'">
            <textarea
              rows={3}
              name="features"
              value={formData.features}
              onChange={handleFieldChange}
              placeholder="Feature line 1&#10;Feature line 2&#10;Feature line 3"
              className="w-full px-3 py-2 bg-brand-very-dark border border-brand-brown text-brand-light-gray font-body text-sm resize-y focus:outline-none focus:border-brand-dark-gray"
            />
          </PopupPanelField>

          {/* IMAGES */}
          <div className="space-y-1 pb-4 pt-6 border-b border-brand-brown">
            <p className="font-display text-sm tracking-wider text-brand-stone uppercase">Product Images</p>
          </div>

          <PopupPanelField label="Images" hint="Upload images or paste URLs. Uploaded images stored in Firebase Storage.">
            <div className="space-y-3">
              {isLoadingImageLibrary && (
                <p className="text-xs text-brand-dark-gray">Loading images from Firebase Storage...</p>
              )}

              {selectableImageLibrary.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-brand-dark-gray">Choose from Firestore + Storage</p>
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
                              ? 'border-brand-dark-gray bg-brand-forest'
                              : 'border-brand-brown bg-brand-very-dark hover:border-brand-dark-gray'
                          }`}
                        >
                          <div className="w-full h-20 rounded bg-brand-forest overflow-hidden mb-2">
                            <img
                              src={image.url}
                              alt={image.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                          <p className="text-xs text-brand-light-gray truncate">{image.title}</p>
                          <p className="text-[11px] text-brand-dark-gray truncate">{image.slug}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!isLoadingImageLibrary && selectableImageLibrary.length === 0 && (
                <p className="text-xs text-brand-dark-gray">No images found in Firebase Storage yet.</p>
              )}

              {getEditingImages().length > 0 && (
                <div className="space-y-2">
                  {getEditingImages().map((image, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 rounded border border-brand-brown bg-brand-very-dark hover:border-brand-rust transition-colors group"
                    >
                      <div className="w-12 h-12 rounded bg-brand-forest flex-shrink-0 overflow-hidden">
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
                        <p className="text-sm text-brand-light-gray truncate font-medium">{getImageLabel(image, idx)}</p>
                        <p className="text-xs text-brand-dark-gray truncate">Image {idx + 1}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="p-2 text-brand-dark-gray hover:text-white hover:bg-brand-brown rounded transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {isUploadingImage && (
                <div className="p-3 rounded border border-brand-rust bg-brand-very-dark">
                  <div className="flex items-center gap-2 mb-2">
                    <Loader className="w-4 h-4 text-brand-stone animate-spin" />
                    <p className="text-sm text-brand-stone">Uploading... {Math.round(uploadProgress)}%</p>
                  </div>
                  <div className="w-full h-2 bg-brand-forest rounded overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-dark-gray to-brand-stone transition-all"
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
                  className="flex-1 h-10 px-3 bg-brand-very-dark border border-brand-brown text-brand-light-gray font-body text-sm focus:outline-none focus:border-brand-dark-gray"
                  disabled={isUploadingImage}
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  disabled={isUploadingImage}
                  className="h-10 px-3 bg-brand-brown text-brand-stone hover:text-white hover:bg-brand-rust disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-1 whitespace-nowrap"
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
                className="w-full h-10 px-3 border-2 border-dashed border-brand-brown text-brand-stone hover:text-white hover:border-brand-dark-gray disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 rounded"
              >
                <Upload className="w-4 h-4" />
                {isUploadingImage ? 'Uploading...' : 'Upload from File Explorer'}
              </button>

              <button
                type="button"
                onClick={handleUploadHoodieDefaults}
                disabled={isUploadingImage}
                className="w-full h-10 px-3 border border-brand-brown text-brand-stone hover:text-white hover:border-brand-dark-gray disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center justify-center gap-2 rounded"
              >
                <Upload className="w-4 h-4" />
                {isUploadingImage ? 'Uploading...' : 'Upload Hoodie Default Images'}
              </button>
            </div>
          </PopupPanelField>

          {/* CATEGORIZATION */}
          <div className="space-y-1 pb-4 pt-6 border-b border-brand-brown">
            <p className="font-display text-sm tracking-wider text-brand-stone uppercase">Categorization</p>
          </div>

          <PopupPanelField label="Tags" hint="Comma separated. E.g. New, Bestseller, Limited Edition">
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleFieldChange}
              placeholder="New, Bestseller"
              className="w-full h-10 px-3 bg-brand-very-dark border border-brand-brown text-brand-light-gray font-body text-sm focus:outline-none focus:border-brand-dark-gray"
            />
          </PopupPanelField>

          {editingProduct ? (
            <>
              <div className="space-y-1 pb-4 pt-6 border-b border-brand-brown">
                <p className="font-display text-sm tracking-wider text-brand-stone uppercase">Danger Zone</p>
              </div>
              <PopupPanelField label="Delete Confirmation" hint="Type DELETE to enable the delete button.">
                <input
                  type="text"
                  name="deleteConfirmation"
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  placeholder="DELETE"
                  className="w-full h-10 px-3 bg-brand-very-dark border border-[#5C2B2B] text-[#FFB3B3] font-body text-sm focus:outline-none focus:border-[#FF7A7A]"
                />
              </PopupPanelField>
            </>
          ) : null}

          {formError && formError.includes('Upload failed') ? (
            <div className="p-3 rounded border border-brand-rust bg-brand-forest space-y-2">
              <p className="font-body text-xs text-brand-dark-gray uppercase tracking-[0.1em]">Firebase Storage Setup</p>
              <p className="font-body text-xs text-brand-stone">
                To enable image uploads, ensure Firebase Storage is enabled in your Firebase console:
              </p>
              <ol className="font-body text-xs text-brand-stone space-y-1 list-decimal list-inside">
                <li>Visit: <span className="text-brand-light-gray">console.firebase.google.com</span></li>
                <li>Go to Storage tab → Click "Start"</li>
                <li>Set Security Rules (see browser console for current rules)</li>
                <li>Retry upload after rules are applied</li>
              </ol>
              <p className="font-body text-xs text-brand-stone italic">
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