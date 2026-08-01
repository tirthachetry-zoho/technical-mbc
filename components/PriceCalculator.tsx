"use client";

import { useState, useEffect } from "react";

type PriceCalculatorProps = {
  defaultPrice?: number;
  defaultDiscount?: number;
};

export default function PriceCalculator({ defaultPrice = 0, defaultDiscount = 0 }: PriceCalculatorProps) {
  const [price, setPrice] = useState(defaultPrice.toString());
  const [discount, setDiscount] = useState(defaultDiscount.toString());

  const finalPrice = parseFloat(price || "0") * (1 - parseFloat(discount || "0") / 100);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Price (₹)</label>
          <input 
            name="price" 
            type="number" 
            step="0.01" 
            placeholder="499" 
            required 
            className="input-field"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Discount %</label>
          <input 
            name="discountPct" 
            type="number" 
            placeholder="0" 
            className="input-field"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>
      </div>
      <div className="text-sm text-green-600 font-medium">
        Final Price: ₹{finalPrice.toFixed(2)}
      </div>
    </>
  );
}
