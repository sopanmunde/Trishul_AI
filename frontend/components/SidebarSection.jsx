import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";

export default function SidebarSection({ icon, title, children, collapsed, onToggle }) {
  return (
    <section>
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center px-2 pt-4 pb-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-700 dark:text-[#8e8ea0] dark:hover:text-zinc-300 transition-colors"
        aria-expanded={!collapsed}
      >
        {title}
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="space-y-0.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
