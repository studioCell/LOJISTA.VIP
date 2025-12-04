
import React, { useState, useEffect } from 'react';
import { useApp } from '../context';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, User, Phone, CheckCircle, CheckSquare, Square } from 'lucide-react';

const Login: React.FC = () => {
  const { login, register } = useApp();
  const navigate = useNavigate();
  
  // State for toggling modes
  const [isRegistering, setIsRegistering] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Load saved credentials on mount
  useEffect(() => {
    const savedCreds = localStorage.getItem('lv_saved_creds');
    if (savedCreds) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(savedCreds);
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
        if (isRegistering) {
            // REGISTRATION LOGIC
            if (password !== confirmPassword) {
                setErrorMsg("As senhas não coincidem.");
                setIsLoading(false);
                return;
            }
            if (password.length < 6) {
                setErrorMsg("A senha deve ter no mínimo 6 caracteres.");
                setIsLoading(false);
                return;
            }
            await register(name, email, password, whatsapp);
            // Register automatically logs in
            navigate('/');
        } else {
            // LOGIN LOGIC
            const success = await login(email, password);
            if (success) {
                // Handle Remember Me
                if (rememberMe) {
                    localStorage.setItem('lv_saved_creds', JSON.stringify({ email, password }));
                } else {
                    localStorage.removeItem('lv_saved_creds');
                }
                navigate('/');
            } else {
                setErrorMsg("E-mail ou senha inválidos.");
            }
        }
    } catch (err: any) {
        setErrorMsg(err.message || "Ocorreu um erro. Tente novamente.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
         <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-yellow-500 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gray-700 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md p-8 bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-2xl z-10 mx-4 animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 tracking-tighter mb-2">LOJISTA<span className="text-white">VIP</span></h1>
          <p className="text-gray-400 text-sm">
            {isRegistering ? "Crie sua conta para começar" : "Acesso exclusivo para membros"}
          </p>
        </div>

        {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-xl mb-4 text-center">
                {errorMsg}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Registration Fields */}
          {isRegistering && (
            <>
                <div className="space-y-2 animate-fade-in">
                    <label className="text-sm text-gray-400 ml-1">Nome Completo</label>
                    <div className="relative">
                    <User className="absolute left-4 top-3.5 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Seu nome ou nome da loja"
                        className="w-full bg-gray-800 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    </div>
                </div>

                <div className="space-y-2 animate-fade-in">
                    <label className="text-sm text-gray-400 ml-1">WhatsApp</label>
                    <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-gray-500" size={20} />
                    <input
                        type="tel"
                        placeholder="11 99999-9999"
                        className="w-full bg-gray-800 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        required
                    />
                    </div>
                </div>
            </>
          )}

          {/* Common Fields */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400 ml-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-500" size={20} />
              <input
                type="email"
                placeholder="seu@email.com"
                className="w-full bg-gray-800 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-400 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-500" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="w-full bg-gray-800 border border-gray-700 text-white pl-12 pr-12 py-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3.5 text-gray-500 hover:text-white transition"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {isRegistering && (
             <div className="space-y-2 animate-fade-in">
                <label className="text-sm text-gray-400 ml-1">Confirmar Senha</label>
                <div className="relative">
                <CheckCircle className="absolute left-4 top-3.5 text-gray-500" size={20} />
                <input
                    type="password"
                    placeholder="********"
                    className="w-full bg-gray-800 border border-gray-700 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-yellow-500 transition"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                </div>
            </div>
          )}

          {/* Remember Me Checkbox */}
          {!isRegistering && (
              <div 
                className="flex items-center space-x-2 cursor-pointer mt-2" 
                onClick={() => setRememberMe(!rememberMe)}
              >
                  {rememberMe ? 
                    <CheckSquare size={18} className="text-yellow-500" /> : 
                    <Square size={18} className="text-gray-500" />
                  }
                  <span className={`text-sm ${rememberMe ? 'text-gray-300' : 'text-gray-500'}`}>
                      Salvar login e senha
                  </span>
              </div>
          )}
          
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 rounded-xl hover:opacity-90 transition transform hover:scale-[1.02] flex items-center justify-center space-x-2 mt-6"
          >
            {isLoading ? 
                <span>Processando...</span> : 
                <><span>{isRegistering ? 'Criar Conta' : 'Acessar Conta'}</span> <ArrowRight size={18}/></>
            }
          </button>
          
          <div className="text-center text-sm text-gray-500 mt-6 border-t border-gray-800 pt-4">
             {isRegistering ? "Já tem uma conta?" : "Ainda não é membro?"} 
             <button 
                type="button"
                onClick={() => {
                    setIsRegistering(!isRegistering);
                    setErrorMsg('');
                }}
                className="ml-2 text-yellow-500 font-bold hover:underline"
             >
                {isRegistering ? "Fazer Login" : "Cadastre-se grátis"}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
