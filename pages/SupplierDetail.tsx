
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context';
import { ArrowLeft, MessageCircle, ShieldCheck, MapPin, Grid, ExternalLink, FileText } from 'lucide-react';

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { suppliers } = useApp();
  const navigate = useNavigate();

  const supplier = suppliers.find(s => s.id === id);

  if (!supplier) {
    return <div className="p-8 text-center">Fornecedor não encontrado.</div>;
  }

  const mapLink = supplier.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(supplier.address || '')}`;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6">
        <ArrowLeft size={20} />
        <span>Voltar</span>
      </button>

      <div className="bg-dark-surface border border-gray-800 rounded-2xl overflow-hidden mb-8">
        <div className="h-48 bg-gradient-to-r from-gray-800 to-gray-900 relative">
          <div className="absolute -bottom-12 left-8">
            <img src={supplier.imageUrl} alt={supplier.name} className="w-32 h-32 rounded-full border-4 border-dark-surface shadow-xl" />
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
           <div className="flex flex-col md:flex-row justify-between items-start gap-4">
             <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  {supplier.name} 
                  {supplier.isVerified && <ShieldCheck className="text-blue-500" size={24} />}
                </h1>
                
                {supplier.cnpj && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <FileText size={12} /> CNPJ: {supplier.cnpj}
                    </p>
                )}
                
                <p className="text-gray-400 mt-2 text-lg font-medium">{supplier.city || 'Localização não informada'}</p>
                <p className="text-sm text-gray-500">{supplier.category}</p>
                
                <div className="flex flex-col space-y-2 mt-4 text-sm text-gray-400">
                   {supplier.address ? (
                       <div className="flex items-start space-x-2">
                          <MapPin size={16} className="mt-0.5 text-gray-500" />
                          <div>
                              <span className="block">{supplier.address}</span>
                              <a 
                                href={mapLink} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-blue-400 hover:underline text-xs flex items-center gap-1 mt-0.5"
                              >
                                  Ver no Google Maps <ExternalLink size={10} />
                              </a>
                          </div>
                       </div>
                   ) : (
                       <div className="flex items-center space-x-2">
                          <MapPin size={16} />
                          <span>Endereço não informado</span>
                       </div>
                   )}
                   
                   <div className="flex items-center space-x-1 text-yellow-400 pt-2">
                     <span>{'★'.repeat(Math.floor(supplier.rating))}</span>
                     <span className="text-gray-500 ml-2 font-bold">{supplier.rating} / 5.0</span>
                  </div>
                </div>
             </div>

             <button 
                onClick={() => window.open(`https://wa.me/${supplier.whatsapp}`, '_blank')}
                className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 shadow-lg hover:shadow-green-500/20 transition transform hover:-translate-y-1 w-full md:w-auto justify-center"
             >
                <MessageCircle size={20} />
                <span>Chamar no WhatsApp</span>
             </button>
           </div>

           <div className="mt-8 border-t border-gray-800 pt-6">
             <h3 className="font-bold text-white mb-2">Sobre a Loja</h3>
             <p className="text-gray-400 leading-relaxed max-w-2xl whitespace-pre-wrap">{supplier.bio}</p>
           </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6 text-xl font-bold text-white">
        <Grid size={24} className="text-yellow-400" />
        <h2>Galeria de Produtos</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
        {supplier.images.map((img, idx) => (
          <div key={idx} className="aspect-square bg-gray-800 rounded-xl overflow-hidden group relative">
            <img src={img} alt={`Produto ${idx}`} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="text-white font-bold border border-white px-4 py-2 rounded-lg">Ver Foto</span>
            </div>
          </div>
        ))}
        {supplier.images.length === 0 && (
             <div className="col-span-3 text-center py-10 text-gray-500 bg-dark-surface rounded-xl border border-gray-800 border-dashed">
                 Nenhuma foto na galeria.
             </div>
        )}
      </div>
    </div>
  );
};

export default SupplierDetail;
