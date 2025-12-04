import React from 'react';
import { useApp } from '../context';
import { Lock, ShoppingBag, Star } from 'lucide-react';

const VipStore: React.FC = () => {
  const { vipProducts } = useApp();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-yellow-500 to-yellow-700 rounded-3xl p-8 mb-10 text-black relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold mb-2">VIP STORE</h2>
          <p className="font-medium opacity-90 text-lg max-w-xl">
            Acessórios exclusivos, manequins e equipamentos para turbinar sua loja. Venda direta do Lojista VIP.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {vipProducts.map(product => (
          <div key={product.id} className="bg-dark-surface border border-gray-800 rounded-2xl overflow-hidden group hover:border-yellow-500/50 transition flex flex-col h-full">
            <div className="relative h-64 bg-gray-800 p-4 flex items-center justify-center">
              <img src={product.imageUrl} alt={product.title} className="max-h-full object-contain group-hover:scale-105 transition duration-500" />
              {product.isLocked && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                  <Lock size={32} className="text-yellow-400 mb-2" />
                  <span className="font-bold">Exclusivo VIP</span>
                  <button className="mt-3 text-xs border border-white px-3 py-1.5 rounded-full hover:bg-white hover:text-black transition">
                    Assinar Agora
                  </button>
                </div>
              )}
              {product.stock < 10 && !product.isLocked && (
                 <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                   Últimas un.
                 </div>
              )}
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-white mb-1 leading-tight">{product.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
              
              <div className="mt-auto flex items-center justify-between">
                <span className="text-xl font-bold text-yellow-400">{product.price}</span>
                <button 
                  disabled={product.isLocked}
                  className={`p-3 rounded-lg flex items-center justify-center transition ${product.isLocked ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-yellow-400'}`}
                >
                  <ShoppingBag size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VipStore;