"use client"

import React, { useState } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { User, Lock, ArrowRight, ArrowUp, ShieldCheck, Fingerprint } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

import { FloatingCode } from "@/components/os/FloatingCode"

export function LoginScreen() {
    const { login } = useWindowManager()
    const [password, setPassword] = useState("")
    const [error, setError] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [step, setStep] = useState<'lock' | 'password'>('lock')
    const [time, setTime] = useState(new Date())
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false)
    const [isBiometricRegistered, setIsBiometricRegistered] = useState(false)
    const [showRegisterPrompt, setShowRegisterPrompt] = useState(false)

    // WebAuthn Utilities
    const bufferToBase64 = (buffer: ArrayBuffer) => {
        return btoa(String.fromCharCode(...new Uint8Array(buffer)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=/g, "");
    }

    const base64ToBuffer = (base64: string) => {
        const binary = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
        const buffer = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            buffer[i] = binary.charCodeAt(i);
        }
        return buffer.buffer;
    }

    React.useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        const timer = setInterval(() => setTime(new Date()), 1000)

        // Check Biometric Availability
        if (window.PublicKeyCredential) {
            window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(available => {
                setIsBiometricAvailable(available)
                const registeredId = localStorage.getItem("sanjuos_biometric_id")
                if (registeredId) setIsBiometricRegistered(true)
            })
        }

        return () => {
            window.removeEventListener('resize', checkMobile)
            clearInterval(timer)
        }
    }, [])

    const handleLogin = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (password === "sanjuos") {
            if (isBiometricAvailable && !isBiometricRegistered) {
                setShowRegisterPrompt(true)
            } else {
                login()
            }
        } else {
            setError(true)
            setTimeout(() => setError(false), 2000)
        }
    }

    const handleBiometricRegister = async () => {
        try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const options: PublicKeyCredentialCreationOptions = {
                challenge,
                rp: { name: "SanjuOS", id: window.location.hostname },
                user: {
                    id: new Uint8Array([1, 2, 3, 4]),
                    name: "sanju@os",
                    displayName: "Sanju"
                },
                pubKeyCredParams: [{ alg: -7, type: "public-key" }],
                authenticatorSelection: {
                    authenticatorAttachment: "platform",
                    userVerification: "required"
                },
                timeout: 60000
            };

            const credential = await navigator.credentials.create({ publicKey: options }) as PublicKeyCredential;
            if (credential) {
                localStorage.setItem("sanjuos_biometric_id", bufferToBase64(credential.rawId));
                setIsBiometricRegistered(true);
                setShowRegisterPrompt(false);
                login();
            }
        } catch (err) {
            console.error("Biometric Registration Failed:", err);
            setShowRegisterPrompt(false);
            login(); // Fallback to normal login even if registration fails
        }
    }

    const handleBiometricAuth = async () => {
        const registeredId = localStorage.getItem("sanjuos_biometric_id");
        if (!registeredId) return;

        try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const options: PublicKeyCredentialRequestOptions = {
                challenge,
                allowCredentials: [{
                    id: base64ToBuffer(registeredId),
                    type: "public-key"
                }],
                userVerification: "required",
                timeout: 60000
            };

            const assertion = await navigator.credentials.get({ publicKey: options });
            if (assertion) {
                login();
            }
        } catch (err) {
            console.error("Biometric Auth Failed:", err);
            setError(true);
            setTimeout(() => setError(false), 2000);
        }
    }


    const renderMobile = () => (
        <div className="h-screen w-full relative bg-[var(--background)] overflow-hidden font-sans">
            {/* High Quality Background */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
                style={{
                    backgroundImage: "var(--mobile-bg)",
                    transform: step === 'password' ? 'scale(1.1)' : 'scale(1)'
                }}
            >
                <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-all duration-500 ${step === 'password' ? 'backdrop-blur-xl bg-black/60' : ''}`} />
            </div>

            <AnimatePresence mode="wait">
                {step === 'lock' ? (
                    <motion.div
                        key="lock-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -100 }}
                        onClick={() => setStep('password')}
                        className="relative h-full w-full flex flex-col items-center justify-between py-20 px-6"
                    >
                        {/* Status Icon */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <Lock size={20} className="text-white/80" />
                            </div>
                        </div>

                        {/* Clock & Date */}
                        <div className="text-center">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-7xl font-light tracking-tighter text-white mb-2"
                            >
                                {format(time, "HH:mm")}
                            </motion.h1>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-lg text-white/70 font-medium"
                            >
                                {format(time, "EEEE, MMMM do")}
                            </motion.p>
                        </div>

                        {/* Swipe Prompt */}
                        <motion.div
                            animate={{ y: [0, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <ArrowUp className="text-white/50" />
                            <span className="text-sm font-bold tracking-[0.2em] text-white/50 uppercase">Tap or Swipe to Unlock</span>
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="password-screen"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="relative h-full w-full flex flex-col items-center justify-center px-6 font-mono"
                    >
                        {/* Background Animation (Floating Code) */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--primary)]/20 via-[var(--background)] to-[var(--background)] opacity-50" />
                        <FloatingCode />
                        <div className="crt-effect pointer-events-none opacity-50" />

                        <div className="z-10 w-full max-w-xs space-y-10 flex flex-col items-center">
                            {/* User Avatar - Anonymous Style */}
                            <div className="w-28 h-28 bg-[var(--os-surface)] rounded-full border-2 border-[var(--primary)]/50 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] overflow-hidden relative">
                                <img src="/DedSec_logo.webp" alt="User" className="w-full h-full object-cover opacity-90" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                            </div>

                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold tracking-[0.2em] text-[var(--foreground)] uppercase">ANONYMOUS</h2>
                                <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">SanjuOS Secure Login</p>
                            </div>

                            {/* Entry Form */}
                            <form onSubmit={handleLogin} className="w-full space-y-4">
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors">
                                        <Lock size={16} />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[var(--os-surface)]/80 border border-[var(--os-border)] rounded px-10 py-3 text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50"
                                        autoFocus
                                    />
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="absolute -bottom-6 left-0 right-0 text-center text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse"
                                        >
                                            Access Denied
                                        </motion.p>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-[var(--foreground)] text-[var(--background)] py-3 rounded font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
                                    >
                                        Unlock
                                    </button>
                                    {isBiometricAvailable && isBiometricRegistered && (
                                        <button
                                            type="button"
                                            onClick={handleBiometricAuth}
                                            className="w-12 h-12 bg-[var(--os-surface)] border border-[var(--os-border)] rounded flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--background)] transition-all"
                                        >
                                            <Fingerprint size={20} />
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setStep('lock')}
                                    className="w-full text-[10px] font-black tracking-[0.3em] text-[var(--muted-foreground)] uppercase py-2 hover:text-[var(--foreground)] transition-colors"
                                >
                                    Cancel
                                </button>
                            </form>
                        </div>

                        {/* Biometric Setup Prompt */}
                        <AnimatePresence>
                            {showRegisterPrompt && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
                                >
                                    <div className="w-full max-w-xs bg-[var(--os-surface)] border border-[var(--os-border)] p-8 rounded-2xl space-y-6 text-center">
                                        <div className="flex justify-center">
                                            <div className="w-16 h-16 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]">
                                                <Fingerprint size={32} />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-lg font-bold">Secure Access</h3>
                                            <p className="text-xs text-[var(--muted-foreground)]">Enable Fingerprint or FaceID for faster, secure logins.</p>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <button
                                                onClick={handleBiometricRegister}
                                                className="w-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 rounded-xl font-bold text-sm"
                                            >
                                                Enable Now
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowRegisterPrompt(false)
                                                    login()
                                                }}
                                                className="w-full text-xs text-[var(--muted-foreground)] font-medium"
                                            >
                                                Maybe Later
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Indicator */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center py-4">
                <div className="w-32 h-1 bg-white/20 rounded-full" />
            </div>
        </div>
    )

    const renderDesktop = () => (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--primary)] font-mono relative overflow-hidden">
            {/* Background Animation (Floating Code) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--primary)]/20 via-[var(--background)] to-[var(--background)]" />
            <FloatingCode />
            <div className="crt-effect pointer-events-none" />

            <div className="z-10 flex flex-col items-center gap-8 w-full max-w-sm px-4">

                {/* User Avatar - Anonymous Style */}
                <div className="w-32 h-32 bg-[var(--os-surface)] rounded-full border-2 border-[var(--primary)]/50 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] overflow-hidden relative">
                    {/* DedSec Logo */}
                    <img src="/DedSec_logo.webp" alt="User" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-2xl font-bold tracking-widest text-[var(--foreground)]">ANONYMOUS</h1>
                    <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest">SanjuOS Secure Login</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
                    <div className="relative group">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors">
                            <Lock size={16} />
                        </div>
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[var(--os-surface)]/80 border border-[var(--os-border)] rounded px-10 py-3 text-sm focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50"
                            autoFocus
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-[var(--os-surface-hover)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] rounded transition-colors text-[var(--muted-foreground)]"
                        >
                            <ArrowRight size={16} />
                        </button>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs text-center font-bold animate-pulse">
                            ACCESS DENIED: INCORRECT PASSWORD
                        </div>
                    )}
                </form>

                <div className="absolute bottom-10 flex gap-8 text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                    <button className="hover:text-[var(--primary)] transition-colors">System Status</button>
                    <button className="hover:text-[var(--primary)] transition-colors">Reboot</button>
                    <button className="hover:text-[var(--primary)] transition-colors">Emergency</button>
                </div>
            </div>
        </div>
    )

    return isMobile ? renderMobile() : renderDesktop()
}
