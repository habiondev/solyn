"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { ProductCard, type ProductCardData } from "./ProductCard";
import { cn } from "@/lib/utils";

export function CatalogTabs({ products }: { products: ProductCardData[] }) {
  const [active, setActive] = useState<string>("ALL");
  const tags = ["ALL", ...Array.from(new Set(products.flatMap((p) => p.tags || [])))].slice(0, 8);
  const filtered = active === "ALL" ? products : products.filter((p) => p.tags?.includes(active));

  return (
    <div>
      <div className="flex flex-wrap gap-2 justify-center mb-7">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={cn("chip", active === t && "chip-on")}
          >
            {t === "ALL" ? "Все" : t}
          </button>
        ))}
      </div>
      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {filtered.map((p) => (
            <motion.div key={p.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <ProductCard p={p} />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
