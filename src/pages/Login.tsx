
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, User, Phone, CheckCircle, CheckSquare, Square, AlertTriangle, Globe } from 'lucide-react';

const Login: React.FC = () => {
  const { login, register, loginWithGoogle, user } = useApp();
  const navigate = useNavigate();
  // Using generic ReturnType to avoid browser vs node TS conflicts
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [isRegistering, setIsRegistering] = useState(false);

  // Form Fields - Pre-filled with Admin Credentials for convenience
  const [name, setName] = useState('');
  const [email, setEmail] = useState('m.mateushugo123@gmail.com');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('12345678');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // EFFECT: Automatically redirect when user is authenticated
  useEffect(() => {
    if (user) {
        navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    const savedCreds = localStorage.getItem('lv_saved_creds');
    if (savedCreds) {
        const { email: savedEmail, password: savedPassword } = JSON.parse(savedCreds);
        // Only override if admin is not the current default
        if (email === 'm.mateushugo123@gmail.com') {
             setEmail(savedEmail);
             setPassword(savedPassword);
             setRememberMe(true);
        }
    }
    return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const getFriendlyErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/configuration-not-found':
        return 'Erro de Configuração: Autenticação por E-mail/Senha não ativada no Firebase.';
      case 'auth/email-already-in-use':
        return 'Este e-mail já está em uso.';
      case 'auth/invalid-email':
        return 'E-mail inválido.';
      case 'auth/operation-not-allowed':
        return 'Método de login DESATIVADO no Console do Firebase.';
      case 'auth/weak-password':
        return 'Senha muito fraca (mínimo 6 caracteres).';
      case 'auth/user-disabled':
        return 'Usuário desativado.';
      case 'auth/user-not-found':
        return 'Usuário não encontrado.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'E-mail ou senha incorretos.';
      case 'auth/too-many-requests':
        return 'Muitas tentativas. Aguarde um momento.';
      case 'auth/popup-closed-by-user':
        return 'Login cancelado pelo usuário.';
      case 'auth/network-request-failed':
        return 'Erro de conexão. Verifique sua internet.';
      default:
        return `Erro: ${errorCode}`;
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    
    try {
        await loginWithGoogle();
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        navigate('/');
    } catch (error: any) {
        console.error(error);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        let msg = error.message;
        if (error.code) msg = getFriendlyErrorMessage(error.code);
        setErrorMsg(msg);
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    // SAFETY TIMEOUT: Force stop loading after 15s if Firebase hangs
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
        setIsLoading((prev) => {
            if (prev) {
                setErrorMsg("Tempo esgotado. Verifique se este domínio está em 'Authorized Domains' no Firebase Console ou sua conexão.");
                return false;
            }
            return false;
        });
    }, 15000);

    try {
        if (isRegistering) {
            // REGISTER
            if (password !== confirmPassword) throw new Error("As senhas não coincidem.");
            if (password.length < 6) throw new Error("Senha mínima de 6 caracteres.");
            
            await register(name, email, password, whatsapp);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setSuccessMsg("Conta criada! Enviamos um e-mail de verificação.");
            navigate('/');
        } else {
            // LOGIN
            try {
                await login(email, password);
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                
                if (rememberMe) {
                    localStorage.setItem('lv_saved_creds', JSON.stringify({ email, password }));
                } else {
                    localStorage.removeItem('lv_saved_creds');
                }
                navigate('/');
            } catch (loginError: any) {
                // AUTO-ADMIN CREATION LOGIC
                // If the specific admin email is not found, try to create it.
                if ((loginError.code === 'auth/user-not-found' || loginError.code === 'auth/invalid-credential') && email === 'm.mateushugo123@gmail.com') {
                    setErrorMsg("Conta Admin não existe. Criando automaticamente...");
                    try {
                        await register('Mateus Hugo (Admin)', email, password, '11999999999');
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                        navigate('/');
                        return;
                    } catch (regError: any) {
                        console.error("Auto-admin creation failed", regError);
                         throw loginError;
                    }
                }
                throw loginError;
            }
        }
    } catch (err: any) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        
        console.error("Auth Error:", err);
        let msg = err.message;
        
        let code = 'unknown';
        if (msg && msg.includes('(auth/')) {
           const match = msg.match(/\(auth\/([^)]+)\)/);
           if (match) code = `auth/${match[1]}`;
           msg = getFriendlyErrorMessage(code);
        } else if (err.code) {
           code = err.code;
           msg = getFriendlyErrorMessage(code);
        }
        setErrorMsg(msg);
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
            <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm p-4 rounded-xl mb-4 text-center flex items-center justify-center gap-2 animate-pulse">
                <AlertTriangle size={18} className="shrink-0 text-red-500" />
                <span>{errorMsg}</span>
            </div>
        )}
        
        {successMsg && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-200 text-sm p-4 rounded-xl mb-4 text-center flex items-center justify-center gap-2">
                <CheckCircle size={18} className="shrink-0 text-green-500" />
                <span>{successMsg}</span>
            </div>
        )}

        <div className="space-y-4">
             {/* Social Login */}
            <button 
                type="button"
                onClick={handleGoogleLogin}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-3 mb-4"
            >
                <Globe size={20} className="text-blue-600" />
                Entrar com Google
            </button>

            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-xs">OU CONTINUE COM E-MAIL</span>
                <div className="flex-grow border-t border-gray-700"></div>
            </div>

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
                    type="password"
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
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-3 rounded-xl hover:opacity-90 transition transform hover:scale-[1.02] flex items-center justify-center space-x-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 
                    <span className="animate-pulse">Processando...</span> : 
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
    </div>
  );
};

export default Login;
