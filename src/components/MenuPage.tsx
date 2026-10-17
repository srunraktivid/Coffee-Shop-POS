import React, { useState, useMemo } from 'react';
import { Product, ProductCategory } from '../types';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  Coffee, 
  AlertCircle,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface MenuPageProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onResetProducts: () => void;
}

const PRESET_IMAGES = [
  { label: 'Iced Latte', url: '/src/assets/images/iced_latte_drink_1792239979015.jpg' },
  { label: 'Hot Americano', url: '/src/assets/images/hot_americano_drink_1792239979955.jpg' },
  { label: 'Artisan Cappuccino', url: '/src/assets/images/cappuccino_drink_1792239980367.jpg' },
  { label: 'Ceremonial Matcha', url: '/src/assets/images/matcha_latte_drink_1792239979972.jpg' },
];

export const MenuPage: React.FC<MenuPageProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetProducts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Hot');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('50');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [available, setAvailable] = useState(true);

  // Form Validation Errors (Phase 4 requirement: Name is required, Price > 0)
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setCategory('Hot');
    setDescription('');
    setStock('50');
    setImage(PRESET_IMAGES[0].url);
    setAvailable(true);
    setErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setCategory(product.category);
    setDescription(product.description || '');
    setStock(product.stock !== undefined ? product.stock.toString() : '50');
    setImage(product.image);
    setAvailable(product.available);
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const newErrors: { name?: string; price?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Drink name is required';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Drink name must be at least 2 characters';
    }

    const parsedPrice = parseFloat(price);
    if (!price || isNaN(parsedPrice) || parsedPrice <= 0) {
      newErrors.price = 'Price is required and must be greater than $0.00';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10) || 0;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        name: name.trim(),
        price: parsedPrice,
        category,
        description: description.trim() || undefined,
        stock: parsedStock,
        image,
        available,
      });
    } else {
      onAddProduct({
        name: name.trim(),
        price: parsedPrice,
        category,
        description: description.trim() || undefined,
        stock: parsedStock,
        image,
        available,
      });
    }

    setIsModalOpen(false);
  };

  const handleToggleAvailability = (product: Product) => {
    onUpdateProduct({
      ...product,
      available: !product.available,
    });
  };

  return (
    <div className="flex-1 overflow-y-auto bg-stone-100 p-6 lg:p-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div>
          <div className="text-xs text-stone-500 font-medium">Catalog &amp; Inventory</div>
          <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
            Menu Management (CRUD)
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onResetProducts}
            className="px-3 py-2 rounded-lg border border-stone-300 text-stone-600 hover:text-stone-900 hover:bg-stone-50 text-xs font-medium transition-colors flex items-center gap-1.5"
            title="Restore default coffee catalog"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default Catalog</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Drink</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search menu drinks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-stone-50 rounded-lg border border-stone-200 focus:bg-white focus:outline-hidden focus:border-stone-400 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 w-full md:w-auto overflow-x-auto">
          {(['All', 'Hot', 'Iced', 'Specialty', 'Bakery'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* The Table (Phase 4 requirement) */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-bold text-stone-900 text-sm">
                            {product.name}
                          </div>
                          {product.description && (
                            <div className="text-[11px] text-stone-500 max-w-sm truncate">
                              {product.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-stone-600 font-medium">
                      {product.category}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-stone-900 tabular-nums">
                      ${product.price.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 font-mono text-stone-600 tabular-nums">
                      {product.stock ?? 0} units
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                          product.available
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                        }`}
                        title="Click to toggle availability"
                      >
                        {product.available ? 'Active' : 'Unavailable'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-md transition-colors"
                          title="Edit Drink"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onDeleteProduct(product.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Drink"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* The Form Modal (Phase 4 requirement: Name is required, Price > 0) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
            <div className="p-5 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">
                {editingProduct ? 'Edit Coffee Drink' : 'Add New Drink to Menu'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {/* Drink Name */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Drink / Item Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Vanilla Bean Flat White"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors(prev => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-hidden ${
                    errors.name
                      ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600'
                      : 'border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Price & Category in row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Price */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.01"
                    placeholder="2.50"
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      if (errors.price) setErrors(prev => ({ ...prev, price: undefined }));
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg border font-mono tabular-nums focus:outline-hidden ${
                      errors.price
                        ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600'
                        : 'border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600'
                    }`}
                  />
                  {errors.price && (
                    <p className="text-xs text-rose-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.price}</span>
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:border-amber-600"
                  >
                    <option value="Hot">Hot Coffee</option>
                    <option value="Iced">Iced Coffee</option>
                    <option value="Specialty">Specialty</option>
                    <option value="Bakery">Bakery &amp; Pastry</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes on tasting profile, bean origin, roast, or preparation method..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-hidden focus:border-amber-600 text-stone-800"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Stock Units
                </label>
                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 font-mono focus:outline-hidden focus:border-amber-600"
                />
              </div>

              {/* Image Preset Picker */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1.5">
                  Select Product Photo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_IMAGES.map((preset) => {
                    const isSelected = image === preset.url;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setImage(preset.url)}
                        className={`relative rounded-lg overflow-hidden border-2 aspect-square p-0.5 transition-all ${
                          isSelected ? 'border-amber-600 ring-2 ring-amber-500/30' : 'border-stone-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover rounded"
                          referrerPolicy="no-referrer"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-amber-600 text-white rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                />
                <span className="text-xs font-medium text-stone-700">
                  Item is active and available for ordering on POS
                </span>
              </label>

              {/* Actions */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 text-xs font-medium hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shadow-2xs"
                >
                  {editingProduct ? 'Save Changes' : 'Create Drink'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
