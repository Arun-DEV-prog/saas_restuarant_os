"use client";

export default function MenuSidebar({ menus, selectedId, onSelect }) {
  return (
    <aside className="w-64 bg-white border-r p-4">
      <h2 className="font-semibold text-gray-700 mb-4">Menus</h2>

      {/*<div className="space-y-1">
        {menus.map((menu) => (
          <button
            key={menu.id}
            onClick={() => onSelect(menu)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium ${
              selectedId === menu.id
                ? "bg-teal-50 text-teal-600"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            {menu.name}
          </button>
        ))}
      </div>*/}
    </aside>
  );
}
