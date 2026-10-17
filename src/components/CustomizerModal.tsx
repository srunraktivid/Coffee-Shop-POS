import React, { useState } from 'react';
import { Product, Customization, DrinkSize, MilkType, SweetnessLevel, TemperatureOption } from '../types';
import { X, Plus, Sparkles } from 'lucide-react';
import { playBeep } from '../utils/audio';

interface CustomizerModalProps {
  product: Product | null;
  onClose: () => void;
  onConfirm: (product: Product, customization: Customization, unitPrice: number) => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  product,
  onClose,
  onConfirm,
}) => {
  if (!product) return null;

  const initialTemp: TemperatureOption = product.category === 'Iced' ? 'Iced' : 'Hot';
  const isBakery = product.category === 'Bakery';

  const [size, setSize] = useState<DrinkSize>('Regular');
  const [milk, setMilk] = useState<MilkType>(isBakery ? 'None' : 'Whole');
  const [sweetness, setSweetness] = useState<SweetnessLevel>('100% (Standard)');
  const [temperature, setTemperature] = useState<TemperatureOption>(initialTemp);
  const [extraShot, setExtraShot] = useState(false);
  const [notes, setNotes] = useState('');

  // Calculate unit price with modifiers
  let unitPrice = product.price;
  if (size === 'Large') unitPrice += 0.60;
  if (milk === 'Oat' || milk === 'Almond') unitPrice += 0.50;
  if (extraShot) unitPrice += 0.80;

  const handleAdd = () => {
    playBeep(920, 0.08);
    onConfirm(
      product,
      {
        size,
        milk,
        sweetness,
        temperature,
        extraShot,
        notes: notes.trim() || undefined,
      },
      unitPrice
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-stone-200 flex items-start justify-between">
          <div className="flex gap-3 items-center">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-xs text-stone-500 font-medium">{product.category} Coffee</div>
              <h3 className="text-lg font-bold text-stone-900">{product.name}</h3>
              <div className="text-sm font-bold text-amber-700 font-mono tabular-nums">
                Base ${product.price.toFixed(2)}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Body */}
        <div className="p-5 space-y-5 overflow-y-auto">
          {!isBakery ? (
            <>
              {/* Temperature */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                  Temperature
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Hot', 'Iced'] as TemperatureOption[]).map((temp) => (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setTemperature(temp)}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                        temperature === temp
                          ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {temp === 'Hot' ? '🔥 Hot' : '❄️ Iced'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cup Size */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Cup Size
                  </label>
                  <span className="text-xs text-stone-400">Large: +$0.60</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(['Regular', 'Large'] as DrinkSize[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={`py-2 px-3 rounded-xl border text-sm font-medium transition-all ${
                        size === s
                          ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {s === 'Regular' ? 'Regular (12 oz)' : 'Large (16 oz)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Milk Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                    Milk Option
                  </label>
                  <span className="text-xs text-stone-400">Plant milk +$0.50</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['Whole', 'Oat', 'Almond', 'Skim', 'None'] as MilkType[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMilk(m)}
                      className={`py-2 px-2 rounded-xl border text-xs font-medium transition-all truncate ${
                        milk === m
                          ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {m} {m === 'Oat' || m === 'Almond' ? '(+$0.50)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sweetness */}
              <div>
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
                  Sweetness Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    '0% (Unsweetened)',
                    '25% (Less)',
                    '50% (Half)',
                    '100% (Standard)',
                  ] as SweetnessLevel[]).map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSweetness(level)}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-medium transition-all truncate ${
                        sweetness === level
                          ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Espresso Shot */}
              <div className="pt-1">
                <label className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-stone-50/60 cursor-pointer hover:bg-stone-50">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={extraShot}
                      onChange={(e) => setExtraShot(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-stone-800">
                      Add Extra Ristretto Shot
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-800 font-mono tabular-nums">
                    +$0.80
                  </span>
                </label>
              </div>
            </>
          ) : (
            <div>
              <p className="text-sm text-stone-600 mb-3">
                Freshly baked artisanal pastry. Served warm upon request.
              </p>
              <label className="flex items-center gap-2 p-3 rounded-xl border border-stone-200 bg-stone-50/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={temperature === 'Hot'}
                  onChange={(e) => setTemperature(e.target.checked ? 'Hot' : 'Iced')}
                  className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                />
                <span className="text-sm font-medium text-stone-800">
                  Warm up in pastry oven
                </span>
              </label>
            </div>
          )}

          {/* Barista Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
              Barista Instructions / Customer Request
            </label>
            <input
              type="text"
              placeholder="e.g. Extra hot, light ice, in customer tumbler..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 focus:outline-hidden focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
            />
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-stone-500">Item Total</div>
            <div className="text-xl font-bold text-stone-900 font-mono tabular-nums">
              ${unitPrice.toFixed(2)}
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Cart · ${unitPrice.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
