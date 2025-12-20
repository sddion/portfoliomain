"use client"
import React, { useState } from "react"
import { useWindowManager } from "@/components/os/WindowManager"
import { Lock, ArrowRight, ArrowUp, ShieldCheck, Fingerprint, Briefcase, User as UserIcon, ChevronLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { FloatingCode } from "@/components/os/FloatingCode"

export function LoginScreen() {
    const { login, updateSettings } = useWindowManager()
    const [password, setPassword] = useState("")
    const [pin, setPin] = useState("")
    const [error, setError] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const [step, setStep] = useState<'lock' | 'selection' | 'password'>('lock')
    const [selectedUser, setSelectedUser] = useState<'guest' | 'recruiter' | null>(null)
    const [time, setTime] = useState(new Date())
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false)
    const [isBiometricRegistered, setIsBiometricRegistered] = useState(false)
    const [showBiometricPrompt, setShowBiometricPrompt] = useState(false)
    const [errorMessage, setErrorMessage] = useState("Access Denied: Invalid Credentials")

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
                const registeredId = localStorage.getItem("sddionOS_biometric_id")
                if (registeredId) setIsBiometricRegistered(true)
            })
        }

        return () => {
            window.removeEventListener('resize', checkMobile)
            clearInterval(timer)
        }
    }, [])

    const handleUserSelect = (userType: 'guest' | 'recruiter') => {
        setSelectedUser(userType)
        setStep('password')
        setPassword("") // Reset password on user switch
    }

    const handleDesktopLogin = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!selectedUser) return

        let isValid = false
        if (selectedUser === 'guest') {
            if (password === 'guest') {
                isValid = true
                await updateSettings({ isRecruiter: false })
            }
        } else if (selectedUser === 'recruiter') {
            if (password === 'admin') {
                isValid = true
                await updateSettings({ isRecruiter: true })
            }
        }

        if (isValid) {
            handleSuccess()
        } else {
            handleError()
        }
    }

    // Mobile PIN Handler
    const handlePinClick = (digit: string) => {
        if (pin.length < 4) {
            const newPin = pin + digit
            setPin(newPin)

            // Auto-submit on 4th digit
            if (newPin.length === 4) {
                setTimeout(() => validatePin(newPin), 300) // Small delay for UX
            }
        }
    }

    const handlePinDelete = () => {
        setPin(prev => prev.slice(0, -1))
    }

    const validatePin = async (inputPin: string) => {
        if (!selectedUser) return

        let isValid = false
        if (selectedUser === 'guest') {
            if (inputPin === '1234') {
                isValid = true
                await updateSettings({ isRecruiter: false })
            }
        } else if (selectedUser === 'recruiter') {
            if (inputPin === '0000') {
                isValid = true
                await updateSettings({ isRecruiter: true })
            }
        }

        if (isValid) {
            handleSuccess()
        } else {
            // Error feedback
            if (navigator.vibrate) navigator.vibrate([100, 50, 100])
            setErrorMessage("Incorrect PIN")
            setError(true)
            setTimeout(() => {
                setError(false)
                setPin("")
            }, 1000)
        }
    }

    const handleSuccess = () => {
        if (isBiometricAvailable && !isBiometricRegistered) {
            setShowBiometricPrompt(true)
        } else {
            login()
        }
    }

    const handleError = () => {
        setErrorMessage("Access Denied: Invalid Credentials")
        setError(true)
        setTimeout(() => setError(false), 3000)
    }

    const handleBiometricRegister = async () => {
        try {
            const challenge = new Uint8Array(32);
            window.crypto.getRandomValues(challenge);

            const options: PublicKeyCredentialCreationOptions = {
                challenge,
                rp: { name: "sddionOS", id: window.location.hostname },
                user: {
                    id: new Uint8Array([1, 2, 3, 4]),
                    name: selectedUser === 'recruiter' ? "recruiter@os" : "guest@os",
                    displayName: selectedUser === 'recruiter' ? "Recruiter" : "Guest"
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
                localStorage.setItem("sddionOS_biometric_id", bufferToBase64(credential.rawId));
                setIsBiometricRegistered(true);
                setShowBiometricPrompt(false);
                login();
            }
        } catch (err: any) {
            if (err.name !== 'NotAllowedError') {
                setErrorMessage("Biometric Setup Failed: System Error")
                setError(true)
                setTimeout(() => setError(false), 3000)
            }
            setShowBiometricPrompt(false);
            login(); // Fallback to normal login even if registration fails
        }
    }

    const handleBiometricAuth = async () => {
        const registeredId = localStorage.getItem("sddionOS_biometric_id");
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
                // If biometric is successful, login as the last successful user type or default to guest
                // For now, we'll just login. A real system would need to track which user the biometric is for.
                login();
            }
        } catch (err: any) {
            if (err.name === 'NotAllowedError') {
                setErrorMessage("Authentication Cancelled")
            } else {
                setErrorMessage("Biometric Authentication Failed")
            }
            setError(true);
            setTimeout(() => setError(false), 3000);
        }
    }


    const renderDesktop = () => (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--background)] text-[var(--primary)] font-mono relative overflow-hidden">
            {/* Background Animation (Floating Code) */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--primary)]/20 via-[var(--background)] to-[var(--background)]" />
            <FloatingCode />
            <div className="crt-effect pointer-events-none" />

            <div className="z-10 flex flex-col items-center gap-8 w-full max-w-4xl px-4 min-h-[400px] justify-center">

                {step === 'selection' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex gap-12 items-center"
                    >
                        {/* Guest Profile */}
                        <div
                            onClick={() => handleUserSelect('guest')}
                            className="group flex flex-col items-center gap-4 cursor-pointer"
                        >
                            <div className="w-40 h-40 bg-[var(--os-surface)] rounded-full border-2 border-[var(--os-border)] group-hover:border-[var(--primary)] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)] transition-all duration-300 relative overflow-hidden">
                                <UserIcon size={64} className="text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                            </div>
                            <div className="text-center space-y-1">
                                <h2 className="text-xl font-bold tracking-widest text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">GUEST</h2>
                                <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">Standard Access</p>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-40 w-[1px] bg-[var(--os-border)]" />

                        {/* Recruiter Profile */}
                        <div
                            onClick={() => handleUserSelect('recruiter')}
                            className="group flex flex-col items-center gap-4 cursor-pointer"
                        >
                            <div className="w-40 h-40 bg-[var(--os-surface)] rounded-full border-2 border-[var(--os-border)] group-hover:border-purple-500 flex items-center justify-center shadow-lg group-hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 relative overflow-hidden">
                                <Briefcase size={64} className="text-[var(--muted-foreground)] group-hover:text-purple-400 transition-colors" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                            </div>
                            <div className="text-center space-y-1">
                                <h2 className="text-xl font-bold tracking-widest text-[var(--foreground)] group-hover:text-purple-400 transition-colors">RECRUITER</h2>
                                <p className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">Full Portfolio Access</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'password' && selectedUser && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col items-center gap-8 w-full max-w-sm"
                    >
                        {/* Selected User Avatar */}
                        <div className="w-32 h-32 bg-[var(--os-surface)] rounded-full border-2 border-[var(--primary)]/50 flex items-center justify-center shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] overflow-hidden relative">
                            {selectedUser === 'recruiter' ? (
                                <Briefcase size={48} className="text-purple-400" />
                            ) : (
                                <UserIcon size={48} className="text-[var(--primary)]" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                        </div>

                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold tracking-widest text-[var(--foreground)] uppercase">{selectedUser}</h1>
                            <p className="text-xs text-[var(--muted-foreground)] uppercase tracking-widest">
                                {selectedUser === 'recruiter' ? 'Restricted Access' : 'Public Access'}
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleDesktopLogin} className="w-full flex flex-col gap-4">
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    placeholder={selectedUser === 'guest' ? "Password (Hint: guest)" : "Password (Hint: admin)"}
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

                            <button
                                type="button"
                                onClick={() => {
                                    setStep('selection')
                                    setSelectedUser(null)
                                }}
                                className="flex items-center justify-center gap-2 text-xs text-[var(--muted-foreground)] hover:text-[var(--primary)] transition-colors mt-2"
                            >
                                <ChevronLeft size={12} />
                                Back to User Selection
                            </button>
                        </form>
                    </motion.div>
                )}

                {/* Initial "Click to Unlock" Step (Desktop) - Optional, can skip to selection */}
                {step === 'lock' && (
                    <div
                        className="flex flex-col items-center gap-4 cursor-pointer animate-pulse"
                        onClick={() => setStep('selection')}
                    >
                        <h1 className="text-6xl font-light text-[var(--foreground)] tracking-tighter">
                            {format(time, "HH:mm")}
                        </h1>
                        <p className="text-[var(--muted-foreground)] uppercase tracking-[0.3em]text-sm">
                            Click to Login
                        </p>
                    </div>
                )}

                <div className="absolute bottom-10 flex gap-8 text-[var(--muted-foreground)] text-xs uppercase tracking-wider">
                    <button className="hover:text-[var(--primary)] transition-colors">System Status</button>
                    <button className="hover:text-[var(--primary)] transition-colors">Reboot</button>
                    <button className="hover:text-[var(--primary)] transition-colors">Emergency</button>
                </div>
            </div>
        </div>
    )

    const renderMobile = () => (
        <div className="h-[100dvh] w-screen relative bg-[var(--background)] overflow-hidden font-sans">
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

            {/* Error Notification Toast - Android Style */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-6 left-0 right-0 z-[100] px-6"
                    >
                        <div className="bg-red-500/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-red-400/50">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-tight">System Notification</h4>
                                <p className="text-[10px] text-white/80 uppercase tracking-widest font-black">{errorMessage}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {step === 'lock' ? (
                    <motion.div
                        key="lock-screen"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -100 }}
                        onClick={() => setStep('selection')}
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
                ) : step === 'selection' ? (
                    <motion.div
                        key="selection"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative h-full w-full flex flex-col items-center justify-center gap-6 px-6"
                    >
                        <h2 className="text-white/80 uppercase tracking-widest font-bold mb-4">Select User</h2>

                        <div
                            onClick={() => {
                                handleUserSelect('guest')
                                setPin("")
                            }}
                            className="w-full bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center gap-4 active:scale-95 transition-transform"
                        >
                            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                                <UserIcon className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold tracking-wider">GUEST</h3>
                                <p className="text-xs text-white/60">Standard Access</p>
                            </div>
                        </div>

                        <div
                            onClick={() => {
                                handleUserSelect('recruiter')
                                setPin("")
                            }}
                            className="w-full bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 flex items-center gap-4 active:scale-95 transition-transform"
                        >
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Briefcase className="text-purple-300" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold tracking-wider">RECRUITER</h3>
                                <p className="text-xs text-white/60">Full Access</p>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="password-screen"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="relative h-full w-full flex flex-col items-center justify-between pb-10 px-6 font-mono"
                    >
                        {/* Empty spacer for top alignment */}
                        <div className="h-10" />

                        <div className="flex flex-col items-center gap-6 w-full">
                            <div className="text-center space-y-2">
                                <h2 className="text-xl font-bold tracking-[0.2em] text-white uppercase">{selectedUser}</h2>
                                <p className="text-[10px] text-white/60 uppercase tracking-widest">
                                    {selectedUser === 'recruiter' ? 'Hint: 0000' : 'Hint: 1234'}
                                </p>
                            </div>

                            {/* PIN Dots */}
                            <div className="flex gap-4">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-4 h-4 rounded-full border border-white transition-colors duration-200 ${i < pin.length ? 'bg-white' : 'bg-transparent'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Numeric Pad */}
                        <div className="w-full max-w-[280px] grid grid-cols-3 gap-x-8 gap-y-6 mb-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                                <button
                                    key={num}
                                    onClick={() => handlePinClick(num.toString())}
                                    className="w-16 h-16 rounded-full bg-white/10 active:bg-white/30 backdrop-blur-md flex items-center justify-center text-2xl font-light text-white transition-colors"
                                >
                                    {num}
                                </button>
                            ))}
                            <div /> {/* Spacer */}
                            <button
                                onClick={() => handlePinClick("0")}
                                className="w-16 h-16 rounded-full bg-white/10 active:bg-white/30 backdrop-blur-md flex items-center justify-center text-2xl font-light text-white transition-colors"
                            >
                                0
                            </button>
                            <button
                                onClick={handlePinDelete}
                                className="w-16 h-16 rounded-full active:bg-white/10 flex items-center justify-center text-white transition-colors"
                            >
                                <ChevronLeft size={24} />
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setStep('selection')
                                setPin("")
                            }}
                            className="w-full text-xs font-bold tracking-widest text-white/50 uppercase py-2 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Biometric Setup Prompt */}
            <AnimatePresence>
                {showBiometricPrompt && (
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
                                <h3 className="text-lg font-bold text-white">Secure Access</h3>
                                <p className="text-xs text-white/60">Enable Fingerprint or FaceID for faster, secure logins.</p>
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
                                        setShowBiometricPrompt(false)
                                        login()
                                    }}
                                    className="w-full text-xs text-white/40 font-medium"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Indicator */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center py-4">
                <div className="w-32 h-1 bg-white/20 rounded-full" />
            </div>
        </div>
    )

    return isMobile ? renderMobile() : renderDesktop()
}
