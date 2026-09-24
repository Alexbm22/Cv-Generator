import React from 'react';

interface PlanCardProps {
  title: string;
  badge?: string;
  priceLabel: string;
  priceSubLabel?: string;
  selected: boolean;
  disabled?: boolean;
  variant?: 'default' | 'offer';
  onSelect: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  badge,
  priceLabel,
  priceSubLabel,
  selected,
  disabled = false,
  variant = 'default',
  onSelect,
}) => {
  const isOffer = variant === 'offer';

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onSelect}
      disabled={disabled}
      aria-pressed={selected}
      aria-disabled={disabled}
      className={`relative w-full flex items-center justify-between gap-4 text-left rounded-2xl border p-4 mt-2.5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2 ${
        isOffer ? 'border-dashed bg-[#f9fbff]' : 'bg-white'
      } ${
        disabled
          ? 'cursor-not-allowed opacity-50 border-[#d2d2d7]/60'
          : selected
          ? 'cursor-pointer border-[#0071e3] ring-2 ring-[#0071e3]/30'
          : 'cursor-pointer border-[#d2d2d7]/60 hover:border-[#0071e3]/60'
      }`}
    >
      {badge && (
        <span
          className={`absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white ${
            isOffer ? 'bg-[#00409f]' : 'bg-[#0071e3]'
          }`}
        >
          {badge}
        </span>
      )}

      <div className="flex items-center gap-3 min-w-0">
        <span
          aria-hidden="true"
          className={`flex items-center justify-center w-5 h-5 rounded-full border-2 flex-shrink-0 ${
            selected ? 'border-[#0071e3]' : 'border-[#d2d2d7]'
          }`}
        >
          {selected && <span className="w-2.5 h-2.5 rounded-full bg-[#0071e3]" />}
        </span>
        <p className="font-semibold text-[#1d1d1f] truncate">{title}</p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="text-lg font-serif text-[#00409f] leading-tight">{priceLabel}</p>
        {priceSubLabel && <p className="text-xs text-[#6e6e73]">{priceSubLabel}</p>}
      </div>
    </button>
  );
};

export default PlanCard;

