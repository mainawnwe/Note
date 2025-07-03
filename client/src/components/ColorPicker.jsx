import React from 'react';

export default function ColorPicker({ label, colors, selectedColor, onSelect }) {
  return (
    <div className="mb-4">
      <div className="mb-2">
        <span className="text-sm font-semibold">{label}:</span>
      </div>
      <div className="flex items-center space-x-2">
        {colors.map((color, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onSelect(color.bg)}
            className={
              "w-8 h-8 rounded-full border-2 transition-transform " +
              (selectedColor === color.bg
                ? "scale-110 ring-2 ring-offset-2 ring-blue-500"
                : "scale-100 hover:scale-110")
            }
            style={{
              backgroundColor: color.bg,
              borderColor: color.border
            }}
          />
        ))}
      </div>
    </div>
  );
}
