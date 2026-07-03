import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/context/useAppStore';

const AuthPage = ({ mode }) => {
  const navigate = useNavigate();
  const login = useAppStore((state) => state.login);
  const register = useAppStore((state) => state.register);
  const loading = useAppStore((state) => state.loading);
  const error = useAppStore((state) => state.error);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const submit = async (event) => {
    event.preventDefault();
    if (mode === 'signup') {
      await register(form);
      navigate('/dashboard');
      return;
    }
    await login({ email: form.email, password: form.password });
    navigate('/dashboard');
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl place-items-center px-4 py-10">
      <form onSubmit={submit} className="w-full max-w-xl rounded-[2rem] border border-white/70 bg-white p-8 shadow-[0_24px_80px_rgba(9,17,31,0.08)]">
        <h1 className="text-3xl font-black">{mode === 'signup' ? 'Create your account' : 'Welcome back'}</h1>
        {error ? <div className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">{error}</div> : null}
        {mode === 'signup' ? <input className="mt-6 w-full rounded-2xl border p-4" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /> : null}
        <input className="mt-4 w-full rounded-2xl border p-4" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="mt-4 w-full rounded-2xl border p-4" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button disabled={loading} className="mt-6 w-full rounded-full bg-[#6d4df2] px-5 py-4 font-semibold text-white">{loading ? 'Please wait...' : mode === 'signup' ? 'Sign up' : 'Login'}</button>
      </form>
    </div>
  );
};

export default AuthPage;
