import React, { useState, useEffect } from 'react'
import './index.css'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isAuth') === 'true')
  const [showHome, setShowHome] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showPassword, setShowPassword] = useState(false)
  const [loggingIn, setLoggingIn] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' or 'signup'
  const [username, setUsername] = useState(() => localStorage.getItem('authUser') || "ROOT_ADMIN")
  const [firstName, setFirstName] = useState(() => localStorage.getItem('authFirstName') || "Admin")
  const [fullName, setFullName] = useState("")
  const [sessionExpired, setSessionExpired] = useState(false)
  
  const handleLogout = () => {
    setIsLoggedIn(false)
    localStorage.removeItem('isAuth')
    localStorage.removeItem('authUser')
    localStorage.removeItem('authFirstName')
    localStorage.removeItem('sessionExpiry')
    setShowHome(true)
  }
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // Quick Sync data from Dashboard
  const [amount, setAmount] = useState(100)
  const [sourceCurrency, setSourceCurrency] = useState('')
  const [targetCurrency, setTargetCurrency] = useState('')

  // Dynamic Financial Profile for Insights
  const [income, setIncome] = useState(50000)
  const [expenses, setExpenses] = useState(30000)
  const [country, setCountry] = useState("India")
  const [region, setRegion] = useState("Telangana")

  // New States for expanded sectors
  const [loanAmount, setLoanAmount] = useState(1000000)
  const [interestRate, setInterestRate] = useState(8.5)
  const [loanTerm, setLoanTerm] = useState(15)
  const [goalTarget, setGoalTarget] = useState(5000000)
  const [sipMonthly, setSipMonthly] = useState(5000)

  // Expanded State Repositories
  const [goals, setGoals] = useState([
    { id: 1, name: 'New Car', target: 1500000, saved: 450000, icon: '🚗', variableCosts: 0 },
    { id: 2, name: 'Home Downpayment', target: 5000000, saved: 1200000, icon: '🏠', variableCosts: 0 },
    { id: 3, name: 'Emergency Fund', target: 300000, saved: 250000, icon: '🚨', variableCosts: 0 }
  ])

  const [budget, setBudget] = useState([
    { category: 'Rent', limit: 15000, spent: 15000 },
    { category: 'Food', limit: 8000, spent: 6500 },
    { category: 'Utilities', limit: 3000, spent: 2800 },
    { category: 'Entertainment', limit: 4000, spent: 4200 },
    { category: 'Other', limit: 5000, spent: 1500 }
  ])

  const [alerts] = useState([
    { id: 1, type: 'CRITICAL', msg: 'Entertainment budget exceeded by ₹200!', time: '2h ago', icon: '⚠️' },
    { id: 2, type: 'INFO', msg: 'SIP due in 3 days: ₹5,000', time: '1d ago', icon: '📅' },
    { id: 3, type: 'SUCCESS', msg: 'Goal "Emergency Fund" is 83% complete', time: '5h ago', icon: '✅' }
  ])

  const [chatMessages, setChatMessages] = useState([
    { sender: 'AI', text: `Greetings, ${firstName}. How can I assist with your financial engine today?` }
  ])
  const [chatInput, setChatInput] = useState('')
  
  // Data synced from money exchange.ipynb
  const currencyDb = {
    "INR": 1.00, "USD": 93.84, "EUR": 108.74, "GBP": 125.70,
    "JPY": 0.59, "CNY": 13.64, "CAD": 68.26, "AUD": 65.40,
    "SGD": 73.36, "AED": 25.55, "SAR": 25.00, "ZAR": 5.52,
    "RUB": 1.16, "BRL": 17.83, "MXN": 5.27, "KRW": 0.025
  }

  const spendingPercent = (expenses / income) * 100
  const savingsAmount = income - expenses
  const healthScore = income > 0 ? Math.max(0, Math.min(100, (savingsAmount / income) * 100)) : 0
  const liquidityRec = income * 0.20
  const spendStatus = spendingPercent < 30 ? "LOW" : spendingPercent < 70 ? "MODERATE" : "HIGH"
  
  const getHealthStatus = (score) => {
    if (score >= 80) return { label: "EXCELLENT", color: "#00ff88" }
    if (score >= 60) return { label: "GOOD", color: "#22d3ee" }
    if (score >= 40) return { label: "AVERAGE", color: "#ffb800" }
    return { label: "RISK", color: "#ff4b4b" }
  }
  const healthInfo = getHealthStatus(healthScore)

  const [insightIdx, setInsightIdx] = useState(0)
  const insights = [
    "Saving just 20% of your income can build long-term wealth.",
    "Emergency funds should cover at least 3–6 months of expenses.",
    "Smart investing beats random spending.",
    "USD is stronger than INR – consider global investment exposure."
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setInsightIdx(prev => (prev + 1) % insights.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const checkSession = () => {
      if (isLoggedIn) {
        const expiry = localStorage.getItem('sessionExpiry')
        if (expiry && Date.now() > Number(expiry)) {
           setSessionExpired(true)
        }
      }
    }
    checkSession()
    const interval = setInterval(checkSession, 60000)
    return () => clearInterval(interval)
  }, [isLoggedIn])

  const handleSignup = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setLoginError("Passwords do not match!")
      return
    }
    setLoggingIn(true)
    setLoginError("")
    try {
      const response = await fetch("http://127.0.0.1:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, full_name: fullName })
      })
      const data = await response.json()
      if (response.ok) {
        setAuthMode('login')
        setLoginError("Account created! Please login.")
      } else {
        setLoginError(data.detail || "Signup Failed")
      }
    } catch (err) {
      setLoginError("Backend Connection Error")
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogin = async (e) => {
    if(e) e.preventDefault()
    setLoggingIn(true)
    setLoginError("")
    
    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      const data = await response.json()
      
      if (response.ok) {
        setIsLoggedIn(true)
        setFirstName(data.first_name || "Admin")
        localStorage.setItem('isAuth', 'true')
        localStorage.setItem('authUser', username)
        localStorage.setItem('authFirstName', data.first_name || "Admin")
        localStorage.setItem('sessionExpiry', Date.now() + 60 * 60 * 1000) // 1 Hour session
        
        // Update initial AI message after login
        setChatMessages([{ sender: 'AI', text: `Greetings, ${data.first_name || "Admin"}. How can I assist with your financial engine today?` }])
      } else {
        setLoginError(data.detail || "Authentication Failed")
      }
    } catch (err) {
      setLoginError("Could not connect to backend. Please ensure the server is running.")
    } finally {
      setLoggingIn(false)
    }
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'insights', label: 'Money Insights', icon: '💡' },
    { id: 'budget', label: 'Budget Tracker', icon: '💰' },
    { id: 'goals', label: 'Goal Planner', icon: '🎯' },
    { id: 'invest', label: 'Investment Advisor', icon: '📈' },
    { id: 'loans', label: 'Loan Analyzer', icon: '💳' },
    { id: 'alerts', label: 'Smart Alerts', icon: '🔔' },
    { id: 'health', label: 'Health Score', icon: '❤️' },
    { id: 'simulator', label: 'Simulator', icon: '🔋' },
    { id: 'expenses', label: 'Expense Analysis', icon: '🔍' },
    { id: 'mentor', label: 'AI Mentor ⭐', icon: '🤖' }
  ]

  // Standard Application Logo (Replacing SVG Bot)
  const BotCharacter = () => (
    <div style={{ width: '130px', height: '130px', margin: '0 auto 1.5rem auto', position: 'relative', overflow: 'hidden', borderRadius: '50%', boxShadow: '0 0 30px rgba(34, 211, 238, 0.3)', border: '2px solid rgba(34,211,238,0.5)' }}>
      <img src="/logo.jpg" alt="AI Money Mentor Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
  );

  if (!isLoggedIn) {
    return (
      <div style={{ 
        background: '#0f172a', 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      }}>
         <div className="glass-card" style={{ 
            maxWidth: '1000px', 
            width: '100%', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            overflow: 'hidden', 
            padding: 0,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255,255,255,0.05)'
         }}>
            {/* Side Branding & Insight Asset */}
            <div style={{ 
               background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', 
               padding: '4rem', 
               display: 'flex', 
               flexDirection: 'column', 
               justifyContent: 'center', 
               position: 'relative',
               borderRight: '1px solid rgba(255,255,255,0.03)'
            }}>
               <div style={{ position: 'absolute', top: '2rem', left: '2rem' }}>
                  <h1 style={{ fontSize: '1rem', color: '#22d3ee', letterSpacing: '4px', margin: 0 }}>AI MONEY MENTOR</h1>
                  <p style={{ fontSize: '0.65rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>SYSTEM_AUTH_v4.0</p>
               </div>
               
               <div style={{ marginTop: '2rem' }}>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#f8fafc', marginBottom: '1rem', lineHeight: 1.1 }}>
                     {authMode === 'login' ? 'Welcome Back.' : 'Initialize Profile.'}
                  </h2>
                  <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '3rem' }}>Smart Finance. Smarter Decisions.</p>
                  
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <p style={{ color: '#3b82f6', fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '1rem' }}>NEURAL_INSIGHT</p>
                     <p style={{ fontSize: '1.1rem', color: '#e2e8f0', fontStyle: 'italic' }}>"{insights[insightIdx]}"</p>
                  </div>
               </div>
            </div>

            {/* Auth Form Section */}
            <div style={{ padding: '4rem', textAlign: 'center', background: 'rgba(15, 23, 42, 0.4)' }}>
               <BotCharacter isPasswordVisible={showPassword} />
               
               <div style={{ marginBottom: '2.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#22d3ee', background: 'rgba(34, 211, 238, 0.1)', padding: '0.4rem 1rem', borderRadius: '100px', fontWeight: '700' }}>
                     {authMode === 'login' ? 'USER_LOGIN' : 'ACCOUNT_CREATION'}
                  </span>
               </div>

               <form onSubmit={authMode === 'login' ? handleLogin : handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {authMode === 'signup' && (
                    <input 
                       type="text" 
                       placeholder="Unique Username" 
                       value={username} 
                       onChange={(e) => setUsername(e.target.value)} 
                       style={{ width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: 'white', outline: 'none', transition: '0.3s' }} 
                       className="auth-input"
                       required 
                    />
                  )}
                  <input 
                     type={authMode === 'login' ? "text" : "email"} 
                     placeholder={authMode === 'login' ? "Username / Email" : "Identity Email"} 
                     value={authMode === 'login' ? (username === "ROOT_ADMIN" ? "" : username) : email} 
                     onChange={(e) => authMode === 'login' ? setUsername(e.target.value) : setEmail(e.target.value)} 
                     style={{ width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: 'white', outline: 'none' }} 
                     required 
                  />
                  
                  <div style={{ position: 'relative' }}>
                     <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Secure Password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => { if (!showPassword) setShowPassword(false) }}
                        style={{ width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: 'white', outline: 'none' }} 
                        required 
                     />
                     <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}
                     >
                        {showPassword ? 'CLOSE_EYES' : 'OBSERVE'}
                     </button>
                  </div>

                  {authMode === 'signup' && (
                    <input 
                       type="password" 
                       placeholder="Retype Password" 
                       value={confirmPassword} 
                       onChange={(e) => setConfirmPassword(e.target.value)} 
                       style={{ width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: 'white', outline: 'none' }} 
                       required 
                    />
                  )}

                  {authMode === 'signup' && (
                    <input 
                       type="text" 
                       placeholder="Your Full Name" 
                       value={fullName} 
                       onChange={(e) => setFullName(e.target.value)} 
                       style={{ width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '1rem', color: 'white', outline: 'none' }} 
                       required 
                    />
                  )}

                  {authMode === 'login' && (
                    <div style={{ textAlign: 'right', marginTop: '-0.5rem' }}>
                       <button type="button" style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer' }}>Forgot Password?</button>
                    </div>
                  )}

                  {loginError && <div style={{ color: '#ff4b4b', fontSize: '0.8rem', background: 'rgba(255, 75, 75, 0.1)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(255,75,75,0.2)' }}>{loginError}</div>}
                  
                  <button className="btn-primary" type="submit" disabled={loggingIn} style={{ height: '55px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                     {loggingIn && <div className="loader-small"></div>}
                     {loggingIn ? 'Synchronizing...' : (authMode === 'login' ? 'Authenticate' : 'Establish Profile')}
                  </button>
               </form>

               <div style={{ marginTop: '2rem', color: '#94a3b8' }}>
                  {authMode === 'login' ? (
                     <p>New user? <button onClick={() => { setAuthMode('signup'); setLoginError(""); }} style={{ background: 'transparent', border: 'none', color: '#8b5cf6', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Sign up</button></p>
                  ) : (
                     <p>Already a mentor? <button onClick={() => { setAuthMode('login'); setLoginError(""); }} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 'bold', cursor: 'pointer', textDecoration: 'underline' }}>Login</button></p>
                  )}
               </div>
            </div>
         </div>
      </div>
    )
  }

  if (showHome) {
    const leftBanks = [
      { name: 'Canara Bank', logo: '/banks/left/=canara bank logo.png' },
      { name: 'Bank of Baroda', logo: '/banks/left/nank of baroda.png' },
      { name: 'PNB', logo: '/banks/left/pnb.png' },
      { name: 'SBI', logo: '/banks/left/sbi.png' }
    ]
    const rightBanks = [
      { name: 'Axis Bank', logo: '/banks/right/axis.png' },
      { name: 'HDFC', logo: '/banks/right/hdfc.png' },
      { name: 'ICICI Bank', logo: '/banks/right/icici.png' },
      { name: 'Kotak Mahindra', logo: '/banks/right/kotak.png' }
    ]

    const BankCard = ({ bank }) => (
      <div className="glass-card bank-logo-card" style={{ 
        width: '140px', 
        height: '90px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '1rem',
        margin: '1rem 0',
        transition: '0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <img src={bank.logo} alt={bank.name} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain', filter: 'brightness(1.1)' }} />
        <div className="bank-name-hidden" style={{ 
          position: 'absolute', 
          bottom: '5px', 
          fontSize: '0.6rem', 
          color: '#22d3ee', 
          opacity: 0, 
          transition: '0.3s' 
        }}>{bank.name}</div>
      </div>
    )

    return (
      <div style={{ 
        background: '#0f172a', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        fontFamily: "'Outfit', sans-serif",
        color: '#f1f5f9'
      }}>
         {/* Top Header */}
         <header style={{ padding: '2rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <div style={{ fontSize: '2rem', filter: 'drop-shadow(0 0 10px rgba(34,211,238,0.5))' }}>🤖</div>
               <div>
                  <h1 style={{ margin: 0, fontSize: '1.5rem', letterSpacing: '4px', color: '#f1f5f9' }}>AI MONEY MENTOR</h1>
                  <span style={{ fontSize: '0.8rem', color: '#22d3ee', letterSpacing: '1px', fontWeight: 'bold' }}>Smarter Financial Decisions with AI</span>
               </div>
            </div>
            <div style={{ fontSize: '0.9rem', color: '#94a3b8', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
               Welcome back, <span style={{ color: '#22d3ee', fontWeight: 'bold' }}>{firstName}</span>
            </div>
         </header>

         {/* Warning Banner */}
         <div style={{ background: 'linear-gradient(90deg, rgba(255, 184, 0, 0.1) 0%, rgba(255, 75, 75, 0.1) 100%)', padding: '0.8rem', textAlign: 'center', borderBottom: '1px solid rgba(255, 184, 0, 0.2)', color: '#ffb800', fontSize: '0.75rem', letterSpacing: '2px', fontWeight: 'bold' }}>
            ⚠️ NOTICE: SYSTEM CURRENTLY SUPPORTS SINGLE-USER LOCALIZED ACCESS ONLY
         </div>

         {/* Hero Section */}
         <main style={{ flex: 1, padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem' }}>
            <div style={{ textAlign: 'center', maxWidth: '800px' }}>
               <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '1.5rem', lineHeight: 1.2, color: '#f1f5f9' }}>
                  Manage Your Wealth <br/>With <span style={{ color: '#22d3ee', textShadow: '0 0 20px rgba(34,211,238,0.5)' }}>Neural Precision.</span>
               </h2>
               <p style={{ fontSize: '1.2rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
                  The future of personal finance. AI Money Mentor autonomously analyzes your cash flow, predicts market shifts, and dynamically optimizes your financial ecosystem.
               </p>
               <button className="btn-primary" style={{ padding: '1.2rem 3rem', fontSize: '1.1rem', letterSpacing: '2px', margin: '0 auto' }} onClick={() => setShowHome(false)}>
                  OPEN DASHBOARD →
               </button>
            </div>

            {/* Feature Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
               {[
                 { title: 'Budget Tracking', icon: '💰', desc: 'Real-time allocation variance and smart limit enforcement.' },
                 { title: 'Goal Planning', icon: '🎯', desc: 'Accelerate milestone achievements with predictive trajectories.' },
                 { title: 'Investment Advice', icon: '📈', desc: 'Risk-adjusted portfolio recommendations optimized for inflation.' },
                 { title: 'Loan Analysis', icon: '💳', desc: 'Restructure your EMI obligations with smart simulations.' },
                 { title: 'Expense Insights', icon: '🔍', desc: 'Granular outflow mapping to detect hidden wealth drains.' }
               ].map((feat, idx) => (
                 <div key={idx} className="glass-card hover-card-neon" style={{ padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1rem', transition: '0.3s transform', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ fontSize: '2rem', background: 'rgba(34, 211, 238, 0.05)', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', border: '1px solid rgba(34, 211, 238, 0.2)' }}>{feat.icon}</div>
                    <div>
                       <h3 style={{ fontSize: '1.1rem', color: '#f1f5f9', margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>{feat.title}</h3>
                       <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>{feat.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
         </main>

         {/* Footer */}
         <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#64748b', fontSize: '0.75rem', letterSpacing: '2px' }}>
            &copy; 2026 AI MONEY MENTOR • SECURE LOCAL RUNTIME
         </footer>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', background: 'rgba(15, 23, 42, 0.95)', borderRight: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', height: '100vh', position: 'sticky', top: 0, boxShadow: '5px 0 15px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', padding: '0 0.5rem' }}>
           <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #22d3ee, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', boxShadow: '0 0 15px rgba(34, 211, 238, 0.4)' }}>🤖</div>
           <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#f1f5f9', letterSpacing: '1px' }}>AI MENTOR</div>
              <div style={{ fontSize: '0.65rem', color: '#22d3ee', letterSpacing: '2px', fontWeight: 'bold' }}>SYSTEM_CORE</div>
           </div>
        </div>
        <div style={{ fontSize: '0.65rem', color: '#64748b', letterSpacing: '2px', fontWeight: 'bold', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>MAIN NAVIGATION</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
          {navItems.map(item => {
             const isAI = item.id === 'mentor';
             const isActive = activeTab === item.id;
             let bg = 'transparent';
             let border = '1px solid transparent';
             let color = '#94a3b8';
             let shadow = 'none';

             if (isActive) {
                if (isAI) {
                   bg = 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(34, 211, 238, 0.05) 100%)';
                   border = '1px solid rgba(139, 92, 246, 0.4)';
                   color = '#c4b5fd';
                   shadow = 'inset 4px 0 0 #8b5cf6, 0 0 20px rgba(139, 92, 246, 0.1)';
                } else {
                   bg = 'linear-gradient(90deg, rgba(34, 211, 238, 0.1) 0%, transparent 100%)';
                   border = '1px solid rgba(34, 211, 238, 0.2)';
                   color = '#22d3ee';
                   shadow = 'inset 4px 0 0 #22d3ee';
                }
             } else if (isAI) {
                color = '#c4b5fd';
                border = '1px dashed rgba(139, 92, 246, 0.3)';
             }

             return (
              <button 
                key={item.id} 
                onClick={() => setActiveTab(item.id)} 
                className={`sidebar-btn ${isActive ? 'active' : ''}`}
                style={{
                  padding: '0.9rem 1.2rem',
                  background: bg,
                  border: border,
                  borderRadius: '12px',
                  color: color,
                  boxShadow: shadow,
                  cursor: 'pointer',
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1.2rem', 
                  fontSize: '0.9rem', 
                  fontWeight: isActive ? '700' : '500', 
                  letterSpacing: '0.5px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                   if (!isActive) {
                      e.currentTarget.style.background = isAI ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.color = isAI ? '#d8b4fe' : '#f1f5f9';
                      e.currentTarget.style.transform = 'translateX(5px)';
                   }
                }}
                onMouseLeave={e => {
                   if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = isAI ? '#c4b5fd' : '#94a3b8';
                      e.currentTarget.style.transform = 'translateX(0)';
                   }
                }}
              >
                <span style={{ fontSize: '1.2rem', filter: isActive ? `drop-shadow(0 0 8px ${isAI ? '#8b5cf6' : '#22d3ee'})` : 'none', transition: '0.3s' }}>{item.icon}</span> 
                {item.label}
              </button>
            )
          })}
        </div>
      </aside>

      <main style={{ flex: 1, overflowY: 'auto' }}>
        <header style={{ padding: '1.5rem 3rem', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#f1f5f9', letterSpacing: '4px' }}>AI MONEY MENTOR</h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.7rem' }}>CORE @ {activeTab.toUpperCase()}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{username}</div>
                <div style={{ fontSize: '0.55rem', color: '#22d3ee' }}>STATUS: ONLINE</div>
             </div>
             <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
             <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)' }}></div>
             <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', fontSize: '1.2rem', padding: '0' }} title="Secure Logout">🚪</button>
          </div>
        </header>

        {sessionExpired && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', maxWidth: '450px', border: '1px solid rgba(255, 75, 75, 0.3)', boxShadow: '0 0 40px rgba(255, 75, 75, 0.2)' }}>
               <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏱️</div>
               <h2 style={{ color: '#ff4b4b', letterSpacing: '2px', margin: '0 0 1rem 0' }}>SESSION EXPIRED</h2>
               <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                  For security protocols, your active runtime session has timed out. Please re-authenticate to continue.
               </p>
               <button className="btn-primary" style={{ padding: '1rem 3rem', width: '100%' }} onClick={() => { setSessionExpired(false); handleLogout(); }}>RE-AUTHENTICATE</button>
            </div>
          </div>
        )}

        <div style={{ padding: '3rem' }}>
          
          {/* Dashboard Tab: Restoring money exchange.ipynb data */}
          {activeTab === 'dashboard' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
               
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                  {/* Manual Quick Sync Terminal */}
                  <div className="glass-card" style={{ textAlign: 'left' }}>
                     <h2 className="accent-text" style={{ fontSize: '1rem', margin: '0 0 1.5rem 0' }}>&gt; QUICK_SYNC_TERMINAL</h2>
                     
                     {/* Currency Converter Section */}
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem' }}>
                        <div>
                           <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>AMOUNT</label>
                           <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', color: 'white', borderRadius: '8px' }} />
                        </div>
                        <div>
                           <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>FROM</label>
                           <select 
                              value={sourceCurrency} 
                              onChange={(e) => setSourceCurrency(e.target.value)} 
                              className="custom-select"
                              style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', color: sourceCurrency ? '#22d3ee' : '#64748b', borderRadius: '8px', cursor: 'pointer' }}
                           >
                              <option value="" disabled>Select Currency</option>
                              {Object.keys(currencyDb).map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                        <div>
                           <label style={{ fontSize: '0.65rem', color: '#94a3b8' }}>TO</label>
                           <select 
                              value={targetCurrency} 
                              onChange={(e) => setTargetCurrency(e.target.value)} 
                              className="custom-select"
                              style={{ width: '100%', background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', color: targetCurrency ? '#22d3ee' : '#64748b', borderRadius: '8px', cursor: 'pointer' }}
                           >
                              <option value="" disabled>Select Currency</option>
                              {Object.keys(currencyDb).map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                        <div style={{ padding: '0.8rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                           {sourceCurrency && targetCurrency ? (
                              <>
                                 <div style={{ fontSize: '0.6rem', color: '#3b82f6' }}>VAL_IN_{targetCurrency}</div>
                                 <div style={{ fontSize: '1.2rem', fontWeight: '800' }}>{targetCurrency === 'INR' ? '₹' : ''}{(amount * (currencyDb[sourceCurrency] / currencyDb[targetCurrency])).toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                              </>
                           ) : (
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', padding: '0.5rem' }}>Please select<br/>both currencies</div>
                           )}
                        </div>
                     </div>

                  </div>
               </div>

               {/* Full Exchange Repository synced from .ipynb */}
               <div className="glass-card" style={{ textAlign: 'left' }}>
                  <h2 className="accent-text" style={{ fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>&gt; SECTOR: MONEY_EXCHANGE_REPOSITORY</h2>
                  <div style={{ width: '100%', overflowX: 'auto', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                      <thead>
                        <tr style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                          <th style={{ padding: '1rem' }}>CURRENCY/CODE</th>
                          <th style={{ padding: '1rem' }}>LIVE_VAL_INR</th>
                          <th style={{ padding: '1rem' }}>REVERSE_RATE</th>
                          <th style={{ padding: '1rem' }}>STATUS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(currencyDb).map(([code, val]) => (
                          <tr key={code} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '1rem', fontWeight: 'bold' }}>{code}</td>
                            <td style={{ padding: '1rem' }}>₹{val.toFixed(3)}</td>
                            <td style={{ padding: '1rem', opacity: 0.6 }}>1 {code} = {val.toFixed(2)} INR</td>
                            <td style={{ padding: '1rem' }}>
                               <span style={{ fontSize: '0.6rem', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #22d3ee', color: '#22d3ee' }}>SYNCED_LIVE</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'insights' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
               {/* Financial Data Input */}
               <div className="glass-card" style={{ padding: '2.5rem', background: 'rgba(15, 23, 42, 0.6)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                     <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(34, 211, 238, 0.2)' }}>
                        <span style={{ fontSize: '1.2rem' }}>⚡</span>
                     </div>
                     <div>
                        <h2 className="accent-text" style={{ fontSize: '1.2rem', margin: '0' }}>FINANCIAL_DATA_CORE</h2>
                        <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>Sync your monthly cash flow to generate real-time AI recommendations.</p>
                     </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                     <div style={{ position: 'relative' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#22d3ee', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>MONTHLY_INCOME</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', transition: '0.3s' }} className="auth-input-container">
                           <span style={{ padding: '1rem', color: '#22d3ee', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)' }}>₹</span>
                           <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="auth-input" style={{ width: '100%', background: 'transparent', border: 'none', padding: '1rem', color: 'white', outline: 'none', fontSize: '1.1rem' }} />
                        </div>
                     </div>
                     <div style={{ position: 'relative' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#ff4b4b', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>MONTHLY_EXPENSES</label>
                        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', transition: '0.3s' }} className="auth-input-container">
                           <span style={{ padding: '1rem', color: '#ff4b4b', fontWeight: 'bold', background: 'rgba(255,255,255,0.02)' }}>₹</span>
                           <input type="number" value={expenses} onChange={(e) => setExpenses(Number(e.target.value))} className="auth-input" style={{ width: '100%', background: 'transparent', border: 'none', padding: '1rem', color: 'white', outline: 'none', fontSize: '1.1rem' }} />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Metrics Row */}
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  <div className={`glass-card ${spendStatus === 'HIGH' ? 'hover-card-warning' : spendStatus === 'MODERATE' ? 'hover-card-neon' : 'hover-card-success'}`} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, letterSpacing: '1px' }}>SPENDING_BEHAVIOR</h3>
                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 'bold', 
                           background: spendStatus === 'HIGH' ? 'rgba(255, 75, 75, 0.1)' : spendStatus === 'MODERATE' ? 'rgba(34, 211, 238, 0.1)' : 'rgba(0, 255, 136, 0.1)',
                           color: spendStatus === 'HIGH' ? '#ff4b4b' : spendStatus === 'MODERATE' ? '#22d3ee' : '#00ff88',
                           border: `1px solid ${spendStatus === 'HIGH' ? 'rgba(255, 75, 75, 0.2)' : spendStatus === 'MODERATE' ? 'rgba(34, 211, 238, 0.2)' : 'rgba(0, 255, 136, 0.2)'}`
                        }}>{spendStatus}</span>
                     </div>
                     <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                           <span style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1 }}>{spendingPercent.toFixed(1)}</span>
                           <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>%</span>
                        </div>
                        <div style={{ marginTop: '1.5rem', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                           <div style={{ width: `${Math.min(spendingPercent, 100)}%`, height: '100%', background: spendStatus === 'HIGH' ? '#ff4b4b' : spendStatus === 'MODERATE' ? '#22d3ee' : '#00ff88', transition: 'width 0.5s ease' }}></div>
                        </div>
                     </div>
                  </div>

                  <div className="glass-card hover-card-success" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, letterSpacing: '1px' }}>SAVINGS_GENERATED</h3>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0, 255, 136, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff88' }}>💰</div>
                     </div>
                     <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                           <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>₹</span>
                           <span style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1, color: '#f1f5f9' }}>{savingsAmount.toLocaleString()}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#00ff88', margin: '1rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                           <span style={{ fontSize: '1rem' }}>↗</span> {savingsAmount >= 0 ? "Active surplus this month" : "Deficit detected"}
                        </p>
                     </div>
                  </div>

                  <div className="glass-card hover-card-blue" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.75rem', color: '#94a3b8', margin: 0, letterSpacing: '1px' }}>LIQUIDITY_TARGET</h3>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>🛡️</div>
                     </div>
                     <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                           <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>₹</span>
                           <span style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: 1, color: '#f1f5f9' }}>{liquidityRec.toLocaleString()}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#3b82f6', margin: '1rem 0 0 0' }}>
                           Recommended minimum reserve (20%)
                        </p>
                     </div>
                  </div>
               </div>

               {/* Smart AI Insight Box */}
               <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.5) 100%)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: '-20px', right: '-20px', fontSize: '8rem', opacity: 0.02, filter: 'blur(4px)' }}>🧠</div>
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                     <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        <span style={{ fontSize: '1.5rem' }}>🤖</span>
                     </div>
                     <div>
                        <h3 style={{ color: '#c4b5fd', fontSize: '0.85rem', letterSpacing: '2px', margin: '0 0 0.5rem 0' }}>NEURAL_RECOMMENDATION</h3>
                        <p style={{ fontSize: '1.1rem', lineHeight: 1.6, color: '#f8fafc', margin: 0, fontWeight: 300 }}>
                           {spendStatus === 'HIGH' 
                              ? "Your expense ratio is currently critically high. To build wealth safely, I advise executing a 15% reduction in variable lifestyle spending this month. Redirect those funds to your emergency reserves."
                              : spendStatus === 'MODERATE'
                              ? "Your cash flow is stable, but there's room for optimization. Try automating ₹" + Math.round(income * 0.1).toLocaleString() + " into a diversified index fund immediately after your paycheck arrives."
                              : "Outstanding discipline detected. With your current surplus, you are primed for advanced growth strategies. Consider maximizing your tax-advantaged accounts or increasing your high-yield allocations."}
                        </p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'mentor' && (
            <div className="glass-card" style={{ height: '70vh', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <h2 className="accent-text" style={{ fontSize: '1.2rem', margin: '0 0 1.5rem 0' }}>&gt; AI_FINANCIAL_MENTOR_INTERFACE</h2>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ alignSelf: msg.sender === 'AI' ? 'flex-start' : 'flex-end', background: msg.sender === 'AI' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(34, 211, 238, 0.1)', padding: '0.8rem 1.2rem', borderRadius: '12px', maxWidth: '80%', border: msg.sender === 'AI' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(34, 211, 238, 0.3)' }}>
                    <div style={{ fontSize: '0.6rem', color: msg.sender === 'AI' ? '#3b82f6' : '#22d3ee', marginBottom: '0.3rem', fontWeight: 'bold' }}>{msg.sender}</div>
                    <div style={{ fontSize: '0.85rem' }}>{msg.text}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!chatInput.trim()) return;
                const userMsg = chatInput;
                setChatMessages(prev => [...prev, { sender: 'USER', text: userMsg }]);
                setChatInput('');
                try {
                  const res = await fetch("http://127.0.0.1:8000/api/mentor/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ message: userMsg, user_name: firstName })
                  });
                  const data = await res.json();
                  if(res.ok) {
                    setChatMessages(prev => [...prev, { sender: 'AI', text: data.reply }]);
                  } else {
                    setChatMessages(prev => [...prev, { sender: 'AI', text: "ERROR: " + (data.detail || "Failed to process") }]);
                  }
                } catch(err) {
                  setChatMessages(prev => [...prev, { sender: 'AI', text: "ERROR: Could not connect to AI core." }]);
                }
              }} style={{ display: 'flex', gap: '1rem' }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Query the AI Mentor..." style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: 'white', borderRadius: '12px' }} />
                <button className="btn-primary">SEND</button>
              </form>
            </div>
          )}

          {activeTab === 'budget' && (() => {
             const totalLimit = budget.reduce((acc, curr) => acc + (Number(curr.limit) || 0), 0);
             const totalSpent = budget.reduce((acc, curr) => acc + (Number(curr.spent) || 0), 0);
             const remaining = totalLimit - totalSpent;
             const overBudget = budget.filter(b => b.spent > b.limit);
             const nearingBudget = budget.filter(b => b.spent <= b.limit && b.spent >= b.limit * 0.8 && b.limit > 0);

             return (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 {/* 1. Total Budget Summary */}
                 <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', padding: '1.5rem 2.5rem', background: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                       <h3 style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.5rem 0', letterSpacing: '1px' }}>TOTAL BUDGET</h3>
                       <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#f1f5f9' }}>₹{totalLimit.toLocaleString()}</div>
                    </div>
                    <div>
                       <h3 style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.5rem 0', letterSpacing: '1px' }}>TOTAL SPENT</h3>
                       <div style={{ fontSize: '1.8rem', fontWeight: '800', color: totalSpent > totalLimit ? '#ff4b4b' : '#f1f5f9' }}>₹{totalSpent.toLocaleString()}</div>
                    </div>
                    <div>
                       <h3 style={{ fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 0.5rem 0', letterSpacing: '1px' }}>REMAINING</h3>
                       <div style={{ fontSize: '1.8rem', fontWeight: '800', color: remaining < 0 ? '#ff4b4b' : '#00ff88' }}>₹{remaining.toLocaleString()}</div>
                    </div>
                 </div>

                 {/* 2. Alert / Warning Indicators */}
                 {overBudget.length > 0 && overBudget.map(b => (
                   <div key={b.category + "-over"} style={{ background: 'rgba(255, 75, 75, 0.05)', borderLeft: '4px solid #ff4b4b', padding: '1.2rem 1.5rem', borderRadius: '0 8px 8px 0', color: '#ff4b4b', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 15px rgba(255,75,75,0.05)' }}>
                     <span style={{ fontSize: '1.2rem' }}>🚨</span> 
                     <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>⚠ You exceeded your {b.category} budget by ₹{(b.spent - b.limit).toLocaleString()}</span>
                   </div>
                 ))}
                 {nearingBudget.length > 0 && nearingBudget.map(b => (
                   <div key={b.category + "-near"} style={{ background: 'rgba(255, 184, 0, 0.05)', borderLeft: '4px solid #ffb800', padding: '1.2rem 1.5rem', borderRadius: '0 8px 8px 0', color: '#ffb800', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 15px rgba(255,184,0,0.05)' }}>
                     <span style={{ fontSize: '1.2rem' }}>⚠️</span> 
                     <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>⚠ {b.category} budget is nearing its limit ({Math.round((b.spent/b.limit)*100)}%)</span>
                   </div>
                 ))}

                 <div className="glass-card" style={{ textAlign: 'left' }}>
                   {/* 6. Monthly Reset / Switch */}
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h2 className="accent-text" style={{ fontSize: '1.2rem', margin: 0 }}>&gt; BUDGET_MATRIX_CORE</h2>
                      <select className="custom-select" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.5rem 1.5rem 0.5rem 1rem', color: '#22d3ee', borderRadius: '8px', cursor: 'pointer', outline: 'none', fontSize: '0.85rem' }}>
                         <option>March 2026</option>
                         <option>February 2026</option>
                         <option>January 2026</option>
                      </select>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     {budget.map((item, index) => {
                       const pct = Math.min((item.spent / (item.limit || 1)) * 100, 200);
                       const displayPct = ((item.spent / (item.limit || 1)) * 100).toFixed(0);
                       // 5. Progress Colors (Smart UX)
                       const progressColor = displayPct <= 70 ? '#00ff88' : displayPct <= 100 ? '#ffb800' : '#ff4b4b';

                       return (
                         <div key={item.category} style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                 <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: progressColor }}>{item.category.toUpperCase()}</span>
                                 {/* 3. Percentage Labels */}
                                 <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', color: progressColor, fontWeight: 'bold', border: `1px solid ${progressColor}40` }}>{displayPct}%</span>
                              </div>
                              {/* 4. Edit / Delete Option */}
                              <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
                                 <div style={{ textAlign: 'right' }}>
                                    <label style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>LIMIT</label>
                                    <input 
                                       type="number" 
                                       value={item.limit} 
                                       onChange={(e) => {
                                          const newBudget = [...budget];
                                          newBudget[index].limit = Number(e.target.value);
                                          setBudget(newBudget);
                                       }}
                                       style={{ width: '80px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', fontSize: '0.85rem', textAlign: 'right', outline: 'none', transition: '0.3s' }}
                                       onFocus={(e) => e.target.style.borderBottom = '1px solid #22d3ee'}
                                       onBlur={(e) => e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)'}
                                    />
                                 </div>
                                 <div style={{ textAlign: 'right' }}>
                                    <label style={{ fontSize: '0.6rem', color: '#94a3b8', display: 'block', marginBottom: '0.2rem' }}>SPENT</label>
                                    <input 
                                       type="number" 
                                       value={item.spent} 
                                       onChange={(e) => {
                                          const newBudget = [...budget];
                                          newBudget[index].spent = Number(e.target.value);
                                          setBudget(newBudget);
                                       }}
                                       style={{ width: '80px', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255, 255, 255, 0.2)', color: 'white', fontSize: '0.85rem', textAlign: 'right', outline: 'none', transition: '0.3s' }}
                                       onFocus={(e) => e.target.style.borderBottom = '1px solid #ff4b4b'}
                                       onBlur={(e) => e.target.style.borderBottom = '1px solid rgba(255, 255, 255, 0.2)'}
                                    />
                                 </div>
                                 <button title="Delete Category" onClick={() => { const newBudget = budget.filter((_, i) => i !== index); setBudget(newBudget); }} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem 0.5rem', opacity: 0.7, transition: '0.2s' }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.7}>✕</button>
                              </div>
                           </div>
                           <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                             <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: progressColor, boxShadow: `0 0 10px ${progressColor}`, transition: 'width 0.4s ease, background 0.4s ease' }}></div>
                           </div>
                         </div>
                       )
                     })}

                     {/* 7. AI Suggestion Box */}
                     <div style={{ marginTop: '0.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.5) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '16px', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                        <div style={{ fontSize: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', padding: '0.6rem', borderRadius: '12px' }}>🤖</div>
                        <div>
                           <h3 style={{ color: '#c4b5fd', fontSize: '0.75rem', letterSpacing: '2px', margin: '0 0 0.5rem 0' }}>AI_BUDGET_ANALYSIS</h3>
                           <p style={{ fontSize: '0.9rem', color: '#f8fafc', margin: 0, lineHeight: 1.6 }}>
                              {overBudget.length > 0 
                                 ? `To restore balance, I recommend actively reducing the "${overBudget[0].category}" spending by at least 15% next month. Redirect ₹${(overBudget[0].spent - overBudget[0].limit).toLocaleString()} from another flexible category to compensate.` 
                                 : nearingBudget.length > 0 
                                 ? `You are approaching the limit on "${nearingBudget[0].category}". Temporarily freeze unnecessary purchases in this sector to ensure you close the month safely.` 
                                 : "Excellent discipline. Your budget limits are perfectly balanced right now. If your current surplus exceeds your plan, increase 'Investments' next month."}
                           </p>
                        </div>
                     </div>

                     {/* Add New Category Interface */}
                     <div style={{ marginTop: '0.5rem', padding: '1.5rem', background: 'rgba(34, 211, 238, 0.03)', borderRadius: '16px', border: '1px dashed rgba(34, 211, 238, 0.2)' }}>
                        <h3 style={{ fontSize: '0.7rem', color: '#22d3ee', margin: '0 0 1rem 0' }}>APPEND_NEW_BUDGET_SECTOR</h3>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                           <input 
                              id="new-category-name"
                              placeholder="Category Name" 
                              style={{ flex: 2, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', color: 'white', borderRadius: '8px', outline: 'none', transition: '0.3s' }} 
                              onFocus={(e) => e.target.style.border = '1px solid #22d3ee'}
                              onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                           />
                           <input 
                              id="new-category-limit"
                              type="number" 
                              placeholder="Limit" 
                              style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.8rem', color: 'white', borderRadius: '8px', outline: 'none', transition: '0.3s' }} 
                              onFocus={(e) => e.target.style.border = '1px solid #22d3ee'}
                              onBlur={(e) => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
                           />
                           <button 
                              onClick={() => {
                                 const name = document.getElementById('new-category-name').value;
                                 const limit = Number(document.getElementById('new-category-limit').value);
                                 if(name && limit) {
                                    setBudget([...budget, { category: name, limit, spent: 0 }]);
                                    document.getElementById('new-category-name').value = '';
                                    document.getElementById('new-category-limit').value = '';
                                 }
                              }}
                              className="btn-primary" 
                              style={{ padding: '0.8rem 1.5rem' }}
                           >
                              ADD
                           </button>
                        </div>
                     </div>
                   </div>
                 </div>
               </div>
             )
          })()}

          {activeTab === 'goals' && (() => {
             // AI Insight variables
             const avgProgress = goals.reduce((acc, g) => acc + (g.saved / (g.target || 1)), 0) / (goals.length || 1);
             const aiSuggestion = avgProgress > 0.6 
                ? "You are doing exceptionally well with your objectives. Consider redirecting some surplus into high-yield investments once Emergency Fund is complete."
                : avgProgress > 0.3
                ? "Steady progress. To accelerate your goals, try increasing your automated monthly SIPs by 10-15%."
                : "Your goals represent a significant financial commitment. I advise extending timelines safely or reducing your monthly variable expenses to fund these.";

             return (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                  {/* Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                        <h2 className="accent-text" style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>&gt; GOAL_PLANNER_CORE</h2>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Strategic timeline management and liquidity targeting.</p>
                     </div>
                     <div style={{ background: 'rgba(34, 211, 238, 0.1)', padding: '0.8rem 1.2rem', borderRadius: '12px', border: '1px solid rgba(34, 211, 238, 0.2)', color: '#22d3ee', fontWeight: 'bold' }}>
                        🏁 {goals.length} ACTIVE GOALS
                     </div>
                  </div>

                  {/* Goal Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                     {goals.map((goal) => {
                        const progress = (goal.saved / (goal.target || 1)) * 100;
                        const defaultMonths = { 1: 18, 2: 48, 3: 6 };
                        const monthsLeft = goal.monthsLeft || defaultMonths[goal.id] || 24;
                        const monthlyReq = Math.max(0, (goal.target - goal.saved) / monthsLeft);
                        
                        let statusColor, statusText, hoverClass;
                        if (progress >= 100) { statusColor = '#00ff88'; statusText = 'COMPLETED'; hoverClass = 'hover-card-success'; }
                        else if (monthlyReq < income * 0.2) { statusColor = '#22d3ee'; statusText = 'ON TRACK'; hoverClass = 'hover-card-neon'; }
                        else if (monthlyReq < income * 0.4) { statusColor = '#ffb800'; statusText = 'MODERATE'; hoverClass = 'hover-card-warning'; }
                        else { statusColor = '#ff4b4b'; statusText = 'BEHIND'; hoverClass = 'hover-card-warning'; }

                        return (
                           <div key={goal.id} className={`glass-card ${hoverClass}`} style={{ textAlign: 'left', padding: '1.8rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                              <div>
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                       <div style={{ fontSize: '2.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '12px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{goal.icon}</div>
                                       <div>
                                          <h3 style={{ margin: '0 0 0.4rem 0', color: '#f1f5f9', fontSize: '1.1rem' }}>{goal.name}</h3>
                                          <span style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderRadius: '8px', background: `${statusColor}20`, color: statusColor, fontWeight: 'bold', border: `1px solid ${statusColor}40` }}>{statusText}</span>
                                       </div>
                                    </div>
                                    <button title="Delete Goal" onClick={() => setGoals(goals.filter(g => g.id !== goal.id))} style={{ background: 'transparent', border: 'none', color: '#ff4b4b', cursor: 'pointer', fontSize: '1.2rem', padding: '0.2rem 0.5rem', opacity: 0.5, transition: '0.2s' }} onMouseEnter={(e) => e.target.style.opacity = 1} onMouseLeave={(e) => e.target.style.opacity = 0.5}>✕</button>
                                 </div>
                                 
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
                                    <div style={{ fontSize: '1.8rem', fontWeight: 'bold', lineHeight: 1 }}>₹{goal.saved.toLocaleString()}</div>
                                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', paddingBottom: '0.2rem' }}>/ ₹{goal.target.toLocaleString()}</div>
                                 </div>
                                 <div style={{ height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', marginBottom: '1.5rem', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: statusColor, boxShadow: `0 0 10px ${statusColor}`, transition: 'width 0.4s ease' }}></div>
                                 </div>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                 <div>
                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.3rem' }}>TIME REMAINING</div>
                                    <div style={{ fontSize: '0.9rem', color: '#f1f5f9', fontWeight: 'bold' }}>{monthsLeft} Months</div>
                                 </div>
                                 <div>
                                    <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: '0.3rem' }}>MONTHLY REQUIRED</div>
                                    <div style={{ fontSize: '0.9rem', color: '#22d3ee', fontWeight: 'bold' }}>₹{Math.ceil(monthlyReq).toLocaleString()}</div>
                                 </div>
                              </div>
                           </div>
                        )
                     })}
                  </div>

                  {/* Smart AI Insight Box */}
                  <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(34, 211, 238, 0.3)', background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.05) 0%, rgba(15, 23, 42, 0.5) 100%)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                     <div style={{ fontSize: '1.5rem', background: 'rgba(34, 211, 238, 0.1)', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(34, 211, 238, 0.2)' }}>🤖</div>
                     <div>
                        <h3 style={{ color: '#22d3ee', fontSize: '0.75rem', letterSpacing: '2px', margin: '0 0 0.5rem 0' }}>AI_GOAL_ANALYSIS</h3>
                        <p style={{ fontSize: '0.9rem', color: '#f8fafc', margin: 0, lineHeight: 1.6 }}>
                           {aiSuggestion}
                        </p>
                     </div>
                  </div>

                  {/* Add New Goal Interface */}
                  <div className="glass-card" style={{ background: 'rgba(34, 211, 238, 0.03)', border: '1px dashed rgba(34, 211, 238, 0.2)', textAlign: 'left', padding: '2rem' }}>
                     <h3 style={{ fontSize: '0.85rem', color: '#22d3ee', margin: '0 0 1.5rem 0', letterSpacing: '1px' }}>&gt; INITIALIZE_NEW_GOAL_NODE</h3>
                     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' }}>
                        <div>
                           <label style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>GOAL TITLE</label>
                           <input id="new-goal-name" placeholder="e.g. Dream Vacation" className="auth-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: 'white', borderRadius: '8px', outline: 'none', transition: '0.3s' }} />
                        </div>
                        <div>
                           <label style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>TARGET AMOUNT (₹)</label>
                           <input id="new-goal-target" type="number" placeholder="250000" className="auth-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: 'white', borderRadius: '8px', outline: 'none', transition: '0.3s' }} />
                        </div>
                        <div>
                           <label style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>TIMELINE (MONTHS)</label>
                           <input id="new-goal-months" type="number" placeholder="24" className="auth-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: 'white', borderRadius: '8px', outline: 'none', transition: '0.3s' }} />
                        </div>
                        <div>
                           <label style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem' }}>EMOJI ICON</label>
                           <input id="new-goal-icon" placeholder="✨ (Default: 🎯)" className="auth-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: 'white', borderRadius: '8px', outline: 'none', transition: '0.3s' }} />
                        </div>
                     </div>
                     <div style={{ marginTop: '2rem', textAlign: 'right' }}>
                        <button 
                           onClick={() => {
                              const name = document.getElementById('new-goal-name').value;
                              const target = Number(document.getElementById('new-goal-target').value);
                              const monthsLeft = Number(document.getElementById('new-goal-months').value) || 12;
                              const icon = document.getElementById('new-goal-icon').value || '🎯';
                              if(name && target) {
                                 setGoals([...goals, { id: Date.now(), name, target, saved: 0, icon, variableCosts: 0, monthsLeft }]);
                                 document.getElementById('new-goal-name').value = '';
                                 document.getElementById('new-goal-target').value = '';
                                 document.getElementById('new-goal-months').value = '';
                                 document.getElementById('new-goal-icon').value = '';
                              }
                           }}
                           className="btn-primary" 
                           style={{ padding: '1rem 2.5rem', letterSpacing: '1px' }}
                        >
                           DEPLOY GOAL
                        </button>
                     </div>
                  </div>
               </div>
             )
          })()}

          {activeTab === 'invest' && <InvestTabComponent />}

          {activeTab === 'loans' && (() => {
             const r = interestRate / 1200;
             const n = loanTerm * 12;
             const emi = loanAmount > 0 && r > 0 && n > 0 ? Math.round((loanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)) : 0;
             const totalPayable = emi * n;
             const totalInterest = Math.max(0, totalPayable - loanAmount);

             const emiRatio = income > 0 ? (emi / income) * 100 : 0;
             
             let affordabilityColor, affordabilityStatus;
             if (emiRatio <= 30) { affordabilityStatus = 'AFFORDABLE'; affordabilityColor = '#00ff88'; }
             else if (emiRatio <= 40) { affordabilityStatus = 'MODERATE'; affordabilityColor = '#ffb800'; }
             else { affordabilityStatus = 'RISKY'; affordabilityColor = '#ff4b4b'; }

             const compareRate = Math.max(0, interestRate - 0.5);
             const r2 = compareRate / 1200;
             const emiCompare = loanAmount > 0 && r2 > 0 && n > 0 ? Math.round((loanAmount * r2 * Math.pow(1 + r2, n)) / (Math.pow(1 + r2, n) - 1)) : 0;
             const totalInterestCompare = Math.max(0, (emiCompare * n) - loanAmount);
             const interestSavedDrop = Math.max(0, totalInterest - totalInterestCompare);

             const extraYearly = 50000;
             const roughSavings = Math.round(totalInterest * 0.15); 

             let aiMsg = "";
             if (emiRatio > 40) {
                aiMsg = `Your EMI ratio is ${emiRatio.toFixed(1)}%, which is critically high. I strongly advise extending the tenure to lower the monthly obligation and avoid cash-flow constraints.`;
             } else if (interestRate >= 9) {
                aiMsg = `Your interest rate of ${interestRate}% is currently above optimal efficiency. Refinancing to just a 0.5% lower rate (${compareRate}%) would automatically save you ₹${interestSavedDrop.toLocaleString()} in interest over the tenure.`;
             } else {
                aiMsg = `Your loan setup is efficient. To accelerate wealth velocity, consider a ₹${extraYearly.toLocaleString()} annual prepayment structure. This simple action can shave years off the tenure and save approximately ₹${roughSavings.toLocaleString()} in compounding interest.`;
             }

             return (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                 {/* Inputs Section with Affordability Status */}
                 <div className="glass-card" style={{ padding: '2rem', background: 'rgba(15, 23, 42, 0.7)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                       <div>
                          <h2 className="accent-text" style={{ fontSize: '1.2rem', margin: '0 0 0.5rem 0' }}>&gt; LOAN_ANALYZER_CORE</h2>
                          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>Dynamic liability restructuring and timeline modeling.</p>
                       </div>
                       <div style={{ background: `${affordabilityColor}20`, color: affordabilityColor, padding: '0.5rem 1.2rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold', border: `1px solid ${affordabilityColor}40`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>{emiRatio <= 30 ? '🟢' : emiRatio <= 40 ? '🟡' : '🔴'}</span> 
                          {affordabilityStatus} (EMI {emiRatio.toFixed(0)}% OF INCOME)
                       </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
                       <div>
                          <label style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>PRINCIPAL_AMOUNT (₹)</label>
                          <input type="number" value={loanAmount || ''} onChange={e => setLoanAmount(Number(e.target.value))} className="auth-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: '#f1f5f9', borderRadius: '8px', outline: 'none', transition: '0.3s' }} />
                       </div>
                       <div>
                          <label style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>INTEREST_RATE (%)</label>
                          <input type="number" value={interestRate || ''} onChange={e => setInterestRate(Number(e.target.value))} className="auth-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: '#f1f5f9', borderRadius: '8px', outline: 'none', transition: '0.3s' }} />
                       </div>
                       <div>
                          <label style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>TENURE (YEARS)</label>
                          <input type="number" value={loanTerm || ''} onChange={e => setLoanTerm(Number(e.target.value))} className="auth-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: '#f1f5f9', borderRadius: '8px', outline: 'none', transition: '0.3s' }} />
                       </div>
                    </div>
                 </div>

                 {/* Outputs: EMI | Interest | Total Payable */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div className="glass-card hover-card-neon" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #22d3ee' }}>
                       <div style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '1rem' }}>MONTHLY_EMI_SCHEDULE</div>
                       <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>₹</span>
                          <span style={{ fontSize: '3rem', fontWeight: '800', color: '#f1f5f9', lineHeight: 1 }}>{emi.toLocaleString()}</span>
                       </div>
                    </div>
                    <div className="glass-card hover-card-warning" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #ffb800' }}>
                       <div style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '1rem' }}>AGGREGATE_INTEREST</div>
                       <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>₹</span>
                          <span style={{ fontSize: '3rem', fontWeight: '800', color: '#ffb800', lineHeight: 1 }}>{totalInterest.toLocaleString()}</span>
                       </div>
                    </div>
                    <div className="glass-card hover-card-success" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #00ff88' }}>
                       <div style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '1rem' }}>TOTAL_PAYABLE_MATRIX</div>
                       <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>₹</span>
                          <span style={{ fontSize: '3rem', fontWeight: '800', color: '#f1f5f9', lineHeight: 1 }}>{totalPayable.toLocaleString()}</span>
                       </div>
                    </div>
                 </div>

                 {/* Bar Chart Visual for Principal vs Interest */}
                 <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                       <h3 style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, letterSpacing: '1px' }}>LIABILITY_DISTRIBUTION</h3>
                       <div style={{ color: '#c4b5fd', fontSize: '0.75rem', fontWeight: 'bold' }}>Principal vs Interest Setup</div>
                    </div>
                    <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <div style={{ width: `${totalPayable > 0 ? (loanAmount / totalPayable) * 100 : 50}%`, background: 'linear-gradient(90deg, #2563eb, #3b82f6)', transition: 'width 0.5s ease' }}></div>
                       <div style={{ width: `${totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 50}%`, background: 'linear-gradient(90deg, #d97706, #f59e0b)', transition: 'width 0.5s ease' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', fontWeight: 'bold' }}>
                       <span style={{ color: '#3b82f6' }}>PRINCIPAL: {totalPayable > 0 ? Math.round((loanAmount / totalPayable) * 100) : 0}%</span>
                       <span style={{ color: '#f59e0b' }}>INTEREST: {totalPayable > 0 ? Math.round((totalInterest / totalPayable) * 100) : 0}%</span>
                    </div>
                 </div>

                 {/* AI Suggestion Box */}
                 <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.5) 100%)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>🤖</div>
                    <div>
                       <h3 style={{ color: '#c4b5fd', fontSize: '0.85rem', letterSpacing: '2px', margin: '0 0 0.8rem 0' }}>AI_LIABILITY_OPTIMIZATION</h3>
                       <p style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
                          {aiMsg}
                       </p>
                    </div>
                 </div>
               </div>
             )
          })()}

          {activeTab === 'alerts' && <AlertsTabComponent />}

          {activeTab === 'health' && (() => {
             // 1. Precise Score Mapping
             let localStatus = {};
             if (healthScore >= 80) localStatus = { label: "EXCELLENT", color: "#00ff88", icon: "🟢" };
             else if (healthScore >= 50) localStatus = { label: "AVERAGE", color: "#ffb800", icon: "🟡" };
             else localStatus = { label: "POOR", color: "#ff4b4b", icon: "🔴" };

             // 2. Breakdown Components
             const savingsPoints = Math.round(healthScore * 0.50);
             const expensePoints = Math.round(healthScore * 0.30);
             const budgetPoints = Math.round(healthScore * 0.20);
             
             // 3. Mini Progress Bar/Trend
             const trend = healthScore >= 70 ? "⬆ +5" : "⬇ -3"; 
             const trendLabel = healthScore >= 70 ? "from last week" : "from last month";
             const trendColor = healthScore >= 70 ? "#00ff88" : "#ff4b4b";

             // 4. AI Suggestion
             let aiRec = "";
             let tipsList = [];
             if (healthScore >= 80) {
                 aiRec = "Your financial efficiency is highly optimized. Maintain this velocity by routing surplus liquidity into diversified growth assets.";
                 tipsList = ["Review portfolio rebalancing", "Focus on tax-efficient strategies"];
             } else if (healthScore >= 50) {
                 aiRec = "Moderate stability detected. Reduce unnecessary expenses and increase savings capacity by 10% to push your score into the Excellent tier.";
                 tipsList = ["Cut entertainment spending", "Automate monthly SIPs"];
             } else {
                 aiRec = "Critical vulnerability detected. You must urgently restructure your budget limits to prioritize emergency savings accumulation.";
                 tipsList = ["Eliminate non-essential subscriptions", "Freeze high-interest credit usage"];
             }

             return (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', textAlign: 'left' }}>
                  {/* Top: Score Circle + Status + Trend */}
                  <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3.5rem 2rem', background: 'rgba(15, 23, 42, 0.7)' }}>
                     <h2 className="accent-text" style={{ fontSize: '1.2rem', margin: '0 0 3.5rem 0' }}>&gt; NEURAL_FINANCIAL_HEALTH</h2>
                     
                     <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '4rem', width: '100%', maxWidth: '800px' }}>
                        
                        {/* Score Circle */}
                        <div style={{ position: 'relative', width: '220px', height: '220px', flexShrink: 0 }}>
                           <div style={{ position: 'absolute', inset: 0, border: '12px solid rgba(255, 255, 255, 0.05)', borderRadius: '50%' }}></div>
                           <div style={{ 
                              position: 'absolute', inset: 0, border: '12px solid ' + localStatus.color, borderRadius: '50%', 
                              borderBottomColor: 'transparent', borderRightColor: 'transparent', 
                              transform: `rotate(${45 + (healthScore * 3.6)}deg)`, 
                              boxShadow: `0 0 25px ${localStatus.color}44`,
                              transition: '1s cubic-bezier(0.4, 0, 0.2, 1)'
                           }}></div>
                           <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ fontSize: '1rem', color: '#94a3b8', letterSpacing: '2px', marginBottom: '-5px' }}>SCORE</div>
                              <div style={{ fontSize: '4rem', fontWeight: '900', color: '#f1f5f9', lineHeight: 1 }}>{Math.round(healthScore)}</div>
                              <div style={{ fontSize: '0.8rem', color: localStatus.color, letterSpacing: '1px', fontWeight: 'bold', marginTop: '5px' }}>/ 100</div>
                           </div>
                        </div>

                        {/* Status + Trend Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, minWidth: '250px' }}>
                           <div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '0.5rem' }}>CURRENT_DIAGNOSTIC_STATUS</div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                 <span style={{ fontSize: '2rem' }}>{localStatus.icon}</span>
                                 <span style={{ fontSize: '2.5rem', fontWeight: '800', color: localStatus.color }}>{localStatus.label}</span>
                              </div>
                           </div>
                           
                           <div>
                              <div style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '0.5rem' }}>MOMENTUM_TREND</div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                 <span style={{ background: `${trendColor}20`, color: trendColor, padding: '0.4rem 1rem', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 'bold', border: `1px solid ${trendColor}40` }}>
                                    {trend} {trendLabel}
                                 </span>
                              </div>
                           </div>

                           {/* Mini Progress Bar for Next Target */}
                           <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                 <span>CURRENT: {Math.round(healthScore)}</span>
                                 <span style={{ color: healthScore < 80 ? '#00ff88' : '#3b82f6' }}>TARGET: {healthScore < 50 ? '50 (Average)' : healthScore < 80 ? '80 (Excellent)' : '100 (Max)'}</span>
                              </div>
                              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                                 <div style={{ height: '100%', width: `${healthScore}%`, background: localStatus.color, transition: '0.5s ease' }}></div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                     {/* Breakdown Structure */}
                     <div className="glass-card" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '0.85rem', color: '#22d3ee', margin: '0 0 2rem 0', letterSpacing: '1px' }}>&gt; SCORE_DECONSTRUCTION</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                           <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                                 <span>SAVINGS_RATIO (<span style={{ color: '#00ff88' }}>50%</span>)</span>
                                 <span>{savingsPoints} / 50</span>
                              </div>
                              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                 <div style={{ height: '100%', width: `${(savingsPoints/50)*100}%`, background: '#00ff88' }}></div>
                              </div>
                           </div>
                           <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                                 <span>EXPENSE_CONTROL (<span style={{ color: '#22d3ee' }}>30%</span>)</span>
                                 <span>{expensePoints} / 30</span>
                              </div>
                              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                 <div style={{ height: '100%', width: `${(expensePoints/30)*100}%`, background: '#22d3ee' }}></div>
                              </div>
                           </div>
                           <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '0.5rem' }}>
                                 <span>BUDGET_DISCIPLINE (<span style={{ color: '#8b5cf6' }}>20%</span>)</span>
                                 <span>{budgetPoints} / 20</span>
                              </div>
                              <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                                 <div style={{ height: '100%', width: `${(budgetPoints/20)*100}%`, background: '#8b5cf6' }}></div>
                              </div>
                           </div>
                        </div>
                     </div>

                     {/* AI Recommendation Box & Tips */}
                     <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', border: `1px solid ${localStatus.color}40`, background: `linear-gradient(135deg, ${localStatus.color}10 0%, rgba(15, 23, 42, 0.5) 100%)` }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                           <div style={{ fontSize: '1.5rem', background: `${localStatus.color}20`, padding: '0.8rem', borderRadius: '12px', border: `1px solid ${localStatus.color}40` }}>🤖</div>
                           <div>
                              <h3 style={{ color: localStatus.color, fontSize: '0.85rem', letterSpacing: '2px', margin: '0 0 0.5rem 0' }}>AI_HEALTH_ADVISORY</h3>
                              <p style={{ fontSize: '1rem', color: '#f8fafc', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
                                 {aiRec}
                              </p>
                           </div>
                        </div>

                        <div style={{ marginTop: '0.5rem', padding: '1.2rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', borderLeft: `4px solid ${localStatus.color}` }}>
                           <h4 style={{ fontSize: '0.7rem', color: '#94a3b8', margin: '0 0 1rem 0', letterSpacing: '1px' }}>QUICK_ACTION_VECTORS:</h4>
                           <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#cbd5e1', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', fontWeight: 'bold' }}>
                              {tipsList.map((tip, idx) => <li key={idx}>{tip}</li>)}
                           </ul>
                        </div>
                     </div>
                  </div>
               </div>
             )
          })()}

          {activeTab === 'simulator' && <SimulatorTabComponent sipMonthly={sipMonthly} setSipMonthly={setSipMonthly} goals={goals} />}

          {activeTab === 'expenses' && (() => {
             const totalBudget = budget.reduce((acc, curr) => acc + curr.limit, 0);
             const totalSpent = budget.reduce((acc, curr) => acc + curr.spent, 0);
             const totalSaved = totalBudget - totalSpent;

             let maxExpenseCat = budget[0];
             let overBudgetCat = null;
             
             budget.forEach(item => {
                if (item.spent > maxExpenseCat.spent) maxExpenseCat = item;
                if (item.spent > item.limit) overBudgetCat = item;
             });

             const sortedBudget = [...budget].sort((a,b) => b.spent - a.spent);

             let aiMsg = "";
             if (overBudgetCat) {
                 aiMsg = `${overBudgetCat.category} exceeded limit by ₹${(overBudgetCat.spent - overBudgetCat.limit).toLocaleString()}. Implement strict outflow limit on this category for the remainder of the cycle.`;
             } else if (totalSaved > 0) {
                 const bestSaver = [...budget].sort((a,b) => (b.limit - b.spent) - (a.limit - a.spent))[0];
                 aiMsg = `Excellent fiscal control. You optimized ₹${(bestSaver.limit - bestSaver.spent).toLocaleString()} in ${bestSaver.category} alone. Routing surplus to neural wealth index is advised.`;
             } else {
                 aiMsg = "Budget utilization is at 100%. No variance detected. Maintain current structural limits.";
             }

             return (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', textAlign: 'left' }}>
                  {/* Summary Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                     <div className="glass-card hover-card-neon" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem', borderTop: '4px solid #3b82f6' }}>
                        <div style={{ fontSize: '2.5rem' }}>💰</div>
                        <div>
                           <div style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '0.2rem' }}>TOTAL_ALLOCATION</div>
                           <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#f1f5f9', lineHeight: 1 }}>₹{totalBudget.toLocaleString()}</div>
                        </div>
                     </div>
                     <div className="glass-card hover-card-warning" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem', borderTop: `4px solid ${totalSpent > totalBudget ? '#ff4b4b' : '#ffb800'}` }}>
                        <div style={{ fontSize: '2.5rem' }}>💸</div>
                        <div>
                           <div style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '0.2rem' }}>TOTAL_OUTFLOW</div>
                           <div style={{ fontSize: '1.6rem', fontWeight: '900', color: totalSpent > totalBudget ? '#ff4b4b' : '#ffb800', lineHeight: 1 }}>₹{totalSpent.toLocaleString()}</div>
                        </div>
                     </div>
                     <div className="glass-card hover-card-success" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem', borderTop: `4px solid ${totalSaved >= 0 ? '#00ff88' : '#ff4b4b'}` }}>
                        <div style={{ fontSize: '2.5rem' }}>📊</div>
                        <div>
                           <div style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '0.2rem' }}>VARIANCE_(SAVED)</div>
                           <div style={{ fontSize: '1.6rem', fontWeight: '900', color: totalSaved >= 0 ? '#00ff88' : '#ff4b4b', lineHeight: 1 }}>{totalSaved > 0 ? '+' : (totalSaved < 0 ? '-' : '')}₹{Math.abs(totalSaved).toLocaleString()}</div>
                        </div>
                     </div>
                  </div>

                  {/* Filter and Export Options */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                           <span style={{ fontSize: '1.2rem' }}>📅</span>
                           <select className="auth-input" style={{ background: 'transparent', border: 'none', color: '#22d3ee', fontWeight: 'bold', cursor: 'pointer', outline: 'none', fontSize: '1rem', padding: 0 }}>
                              <option value="current" style={{ background: '#0f172a' }}>March 2026</option>
                              <option value="prev1" style={{ background: '#0f172a' }}>February 2026</option>
                              <option value="prev2" style={{ background: '#0f172a' }}>January 2026</option>
                           </select>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>TIMEFRAME: 31 DAYS</span>
                     </div>
                     <button style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: '#f1f5f9', padding: '0.5rem 1.2rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.05)'}>
                        <span style={{ fontSize: '1rem' }}>📥</span> EXPORT CSV
                     </button>
                  </div>

                  {/* Main Table */}
                  <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                     <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15, 23, 42, 0.5)' }}>
                        <h2 className="accent-text" style={{ fontSize: '1.2rem', margin: 0 }}>&gt; EXPENSE_DECONSTRUCTION_LOG</h2>
                     </div>
                     <div style={{ width: '100%', overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                           <thead>
                              <tr style={{ background: 'rgba(34, 211, 238, 0.05)', color: '#22d3ee', letterSpacing: '1px' }}>
                                 <th style={{ padding: '1.2rem 2rem' }}>FLOW_CATEGORY</th>
                                 <th style={{ padding: '1.2rem 1rem', width: '25%' }}>UTILIZATION_VISUAL</th>
                                 <th style={{ padding: '1.2rem 1rem' }}>OUTFLOW / LIMIT</th>
                                 <th style={{ padding: '1.2rem 2rem', textAlign: 'right' }}>DISTRIBUTION %</th>
                              </tr>
                           </thead>
                           <tbody style={{ color: '#f1f5f9' }}>
                              {sortedBudget.map((item, index) => {
                                 const itemPercent = totalSpent > 0 ? ((item.spent / totalSpent) * 100).toFixed(1) : 0;
                                 const usagePercent = item.limit > 0 ? (item.spent / item.limit) * 100 : 0;
                                 let uColor = '#00ff88';
                                 if (usagePercent > 100) uColor = '#ff4b4b';
                                 else if (usagePercent > 80) uColor = '#ffb800';

                                 return (
                                    <tr key={index} style={{ borderBottom: index === sortedBudget.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.03)', background: item.spent > item.limit ? 'rgba(255, 75, 75, 0.05)' : 'transparent', transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = item.spent > item.limit ? 'rgba(255, 75, 75, 0.05)' : 'transparent'}>
                                       <td style={{ padding: '1.2rem 2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: uColor, boxShadow: `0 0 10px ${uColor}` }}></div>
                                          {item.category.toUpperCase()}
                                          {item === maxExpenseCat && <span style={{ fontSize: '0.65rem', background: 'rgba(34, 211, 238, 0.1)', color: '#22d3ee', padding: '0.2rem 0.5rem', borderRadius: '4px', marginLeft: '0.5rem', border: '1px solid rgba(34,211,238,0.3)', fontWeight: 'bold' }}>MAX</span>}
                                       </td>
                                       <td style={{ padding: '1.2rem 1rem' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                             <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.5)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ height: '100%', width: `${Math.min(usagePercent, 100)}%`, background: uColor, borderRadius: '3px', transition: 'width 1s ease' }}></div>
                                             </div>
                                             <span style={{ fontSize: '0.7rem', color: uColor, fontWeight: 'bold', width: '35px', textAlign: 'right' }}>{Math.round(usagePercent)}%</span>
                                          </div>
                                       </td>
                                       <td style={{ padding: '1.2rem 1rem' }}>
                                          <span style={{ color: item.spent > item.limit ? '#ff4b4b' : '#f1f5f9', fontWeight: 'bold', fontSize: '1rem' }}>₹{item.spent.toLocaleString()}</span>
                                          <span style={{ color: '#64748b', fontSize: '0.8rem', margin: '0 0.4rem' }}>/</span>
                                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>₹{item.limit.toLocaleString()}</span>
                                       </td>
                                       <td style={{ padding: '1.2rem 2rem', textAlign: 'right', fontWeight: 'bold', color: '#cbd5e1' }}>
                                          {itemPercent}%
                                       </td>
                                    </tr>
                                 )
                              })}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  {/* AI Suggestion */}
                  <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.5) 100%)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                     <div style={{ fontSize: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>🤖</div>
                     <div>
                        <h3 style={{ color: '#c4b5fd', fontSize: '0.85rem', letterSpacing: '2px', margin: '0 0 0.8rem 0' }}>AI_MENTOR_INSIGHT</h3>
                        <p style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
                           {aiMsg}
                        </p>
                     </div>
                  </div>
               </div>
             )
          })()}
        </div>
      </main>
    </div>
  )
}

const InvestTabComponent = () => {
   const [riskProfile, setRiskProfile] = useState('Moderate');
   const [investAmount, setInvestAmount] = useState(50000);
   const [investPeriod, setInvestPeriod] = useState(5);

   const portfolios = {
      Conservative: { returnExpected: '7', returnText: '7–9%', equity: 20, debt: 60, gold: 20, color: '#00ff88', riskColor: '#00ff88', riskLevel: 'Low Risk', aiMsg: 'Based on your conservative risk profile, we recommend prioritizing liquid debt funds and sovereign gold bonds to protect capital while still beating inflation.' },
      Moderate: { returnExpected: '11', returnText: '10–12%', equity: 50, debt: 30, gold: 10, other: 10, color: '#22d3ee', riskColor: '#ffb800', riskLevel: 'Medium Risk', aiMsg: 'Maintaining a 50% equity split ensures growth while keeping 30% in debt insulates against severe market shocks. Given the current bullish trend, consider maintaining this balance.' },
      Aggressive: { returnExpected: '16', returnText: '15–18%', equity: 80, debt: 10, gold: 10, color: '#ff4b4b', riskColor: '#ff4b4b', riskLevel: 'High Risk', aiMsg: 'Market is currently exhibiting bullish momentum. With an aggressive profile, you are well-positioned to capitalize on tech and emerging sector growth. Ensure you review quarterly.' }
   };

   const profile = portfolios[riskProfile];

   return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* User Risk Profile Selector & Amount */}
            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(15, 23, 42, 0.7)' }}>
               <h2 className="accent-text" style={{ fontSize: '1.2rem', margin: 0 }}>&gt; INVESTMENT_PARAMETERS</h2>
               
               <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>RISK_PROFILE_PREFERENCE</label>
                  <select value={riskProfile} onChange={e => setRiskProfile(e.target.value)} className="auth-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: '#f1f5f9', borderRadius: '8px', cursor: 'pointer', outline: 'none', transition: '0.3s' }}>
                     <option value="Conservative">Conservative</option>
                     <option value="Moderate">Moderate</option>
                     <option value="Aggressive">Aggressive</option>
                  </select>
               </div>

               <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>INVESTMENT_AMOUNT (₹)</label>
                  <input type="number" value={investAmount || ''} onChange={e => setInvestAmount(Number(e.target.value))} className="auth-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: '#f1f5f9', borderRadius: '8px', outline: 'none', transition: '0.3s' }} />
               </div>

               <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '0.5rem', display: 'block', fontWeight: 'bold' }}>TIME_HORIZON (YEARS)</label>
                  <input type="number" value={investPeriod || ''} onChange={e => setInvestPeriod(Number(e.target.value))} className="auth-input" style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: '#f1f5f9', borderRadius: '8px', outline: 'none', transition: '0.3s' }} />
               </div>
            </div>

            {/* AI Expected Returns & Sentiment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div className={`glass-card hover-card-${riskProfile === 'Conservative' ? 'success' : riskProfile === 'Moderate' ? 'neon' : 'warning'}`} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                     <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '0.8rem', letterSpacing: '1px' }}>PROJECTED_YIELD</h3>
                     <span style={{ background: `${profile.color}20`, color: profile.color, padding: '0.3rem 0.8rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', border: `1px solid ${profile.color}40` }}>{profile.returnText} Annually</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                     <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>₹</span>
                     <span style={{ fontSize: '3rem', fontWeight: '800', lineHeight: 1, color: '#f1f5f9' }}>{Math.round(investAmount * Math.pow(1 + parseInt(profile.returnExpected)/100, investPeriod || 1)).toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem' }}>Estimated portfolio value after {investPeriod || 1} years of compounding.</div>
               </div>
               
               <div className="glass-card" style={{ padding: '1.5rem 2rem', borderLeft: `4px solid ${profile.riskColor}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                     <h3 style={{ margin: 0, color: '#94a3b8', fontSize: '0.75rem', letterSpacing: '1px' }}>MARKET_RISK_INDICATOR</h3>
                     <span style={{ background: `${profile.riskColor}20`, color: profile.riskColor, padding: '0.2rem 0.6rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 'bold', border: `1px solid ${profile.riskColor}40` }}>{profile.riskLevel}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                     Market currently shows <span style={{ color: '#00ff88', fontWeight: 'bold' }}>neutral-to-bullish momentum</span>. Avoid emotional restructuring.
                  </p>
               </div>
            </div>
         </div>

         {/* Portfolio Allocation & Visuals */}
         <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ margin: '0 0 2rem 0', color: '#22d3ee', fontSize: '1.1rem', letterSpacing: '1px' }}>&gt; DYNAMIC_ASSET_ALLOCATION</h3>
            
            {/* Visual Bar Setup */}
            <div style={{ display: 'flex', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
               <div style={{ width: `${profile.equity}%`, background: 'linear-gradient(90deg, #2563eb, #3b82f6)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} title={`Equity: ${profile.equity}%`}></div>
               <div style={{ width: `${profile.debt}%`, background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} title={`Debt: ${profile.debt}%`}></div>
               <div style={{ width: `${profile.gold}%`, background: 'linear-gradient(90deg, #d97706, #f59e0b)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} title={`Gold: ${profile.gold}%`}></div>
               {profile.other && <div style={{ width: `${profile.other}%`, background: 'linear-gradient(90deg, #059669, #10b981)', transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }} title={`Alternative: ${profile.other}%`}></div>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
               <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #3b82f6', borderTop: '1px solid rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.8rem', letterSpacing: '1px' }}>EQUITY / INDEX FUNDS</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                     <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f1f5f9' }}>₹{Math.round(investAmount * (profile.equity/100)).toLocaleString()}</span>
                     <span style={{ fontSize: '0.85rem', color: '#3b82f6', fontWeight: 'bold' }}>{profile.equity}%</span>
                  </div>
               </div>
               <div style={{ background: 'rgba(139, 92, 246, 0.05)', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #8b5cf6', borderTop: '1px solid rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.8rem', letterSpacing: '1px' }}>DEBT / BONDS</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                     <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f1f5f9' }}>₹{Math.round(investAmount * (profile.debt/100)).toLocaleString()}</span>
                     <span style={{ fontSize: '0.85rem', color: '#8b5cf6', fontWeight: 'bold' }}>{profile.debt}%</span>
                  </div>
               </div>
               <div style={{ background: 'rgba(245, 158, 11, 0.05)', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #f59e0b', borderTop: '1px solid rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.8rem', letterSpacing: '1px' }}>GOLD / COMMODITIES</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                     <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f1f5f9' }}>₹{Math.round(investAmount * (profile.gold/100)).toLocaleString()}</span>
                     <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 'bold' }}>{profile.gold}%</span>
                  </div>
               </div>
               {profile.other && (
               <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '16px', borderLeft: '4px solid #10b981', borderTop: '1px solid rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.8rem', letterSpacing: '1px' }}>ALTERNATIVE / CASH</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                     <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f1f5f9' }}>₹{Math.round(investAmount * (profile.other/100)).toLocaleString()}</span>
                     <span style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold' }}>{profile.other}%</span>
                  </div>
               </div>
               )}
            </div>
         </div>

         {/* AI Recommendation Box */}
         <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(15, 23, 42, 0.5) 100%)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.5rem', background: 'rgba(139, 92, 246, 0.1)', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(139, 92, 246, 0.2)' }}>🤖</div>
            <div>
               <h3 style={{ color: '#c4b5fd', fontSize: '0.85rem', letterSpacing: '2px', margin: '0 0 0.8rem 0' }}>AI_PORTFOLIO_RECOMMENDATION</h3>
               <p style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
                  {profile.aiMsg}
               </p>
            </div>
         </div>
      </div>
   );
};

const AlertsTabComponent = () => {
   const [alerts, setAlerts] = useState([
      { id: 1, type: 'CRITICAL', msg: 'Entertainment budget exceeded by ₹200!', time: '2h ago', fullTime: 'Today 10:30 PM', icon: '⚠️', actionMsg: 'Reduce entertainment budget by ₹200 to balance matrix', read: false },
      { id: 2, type: 'WARNING', msg: 'Savings rate dropped below 20% optimal threshold.', time: '4h ago', fullTime: 'Today 08:15 PM', icon: '📉', actionMsg: 'View auto-savings configuration', read: false },
      { id: 3, type: 'INFO', msg: 'SIP equivalent to ₹5,000 due in 3 days.', time: '1d ago', fullTime: 'Yesterday 09:15 AM', icon: '📅', actionMsg: 'Verify linked account liquidity', read: false },
      { id: 4, type: 'SUCCESS', msg: 'Goal "Emergency Fund" has reached 83% completion.', time: '5h ago', fullTime: 'Today 07:45 PM', icon: '✅', actionMsg: 'Analyze timeline acceleration options', read: true }
   ]);
   const [filter, setFilter] = useState('ALL');
   const [smartEnabled, setSmartEnabled] = useState(true);

   const typePriorities = { 'CRITICAL': 1, 'WARNING': 2, 'INFO': 3, 'SUCCESS': 4 };

   const handleDismiss = (id) => setAlerts(alerts.filter(a => a.id !== id));
   const handleMarkRead = (id) => setAlerts(alerts.map(a => a.id === id ? { ...a, read: true } : a));
   const handleSnooze = (id) => setAlerts(alerts.filter(a => a.id !== id));

   let filteredAlerts = alerts;
   if (filter !== 'ALL') filteredAlerts = alerts.filter(a => a.type === filter);

   filteredAlerts = [...filteredAlerts].sort((a, b) => {
      if (a.read === b.read) return typePriorities[a.type] - typePriorities[b.type];
      return a.read ? 1 : -1;
   });

   const getTypeColor = (type) => {
      switch(type) {
         case 'CRITICAL': return '#ff4b4b';
         case 'WARNING': return '#ffb800';
         case 'SUCCESS': return '#00ff88';
         case 'INFO': default: return '#3b82f6';
      }
   };

   const unreadCount = alerts.filter(a => !a.read).length;

   return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
         <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
               <h2 className="accent-text" style={{ fontSize: '1.2rem', margin: 0 }}>&gt; SMART_NOTIFICATIONS</h2>
               <div style={{ background: unreadCount > 0 ? 'rgba(255, 75, 75, 0.1)' : 'rgba(0, 255, 136, 0.1)', color: unreadCount > 0 ? '#ff4b4b' : '#00ff88', padding: '0.4rem 1rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', border: `1px solid ${unreadCount > 0 ? '#ff4b4b40' : '#00ff8840'}` }}>
                  🔔 {unreadCount} Active Alerts
               </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
               <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>Enable Smart Alerts</span>
               <div onClick={() => setSmartEnabled(!smartEnabled)} style={{ width: '40px', height: '20px', background: smartEnabled ? '#22d3ee' : 'rgba(255,255,255,0.1)', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                  <div style={{ position: 'absolute', top: '2px', left: smartEnabled ? '22px' : '2px', width: '16px', height: '16px', background: 'white', borderRadius: '50%', transition: '0.3s' }}></div>
               </div>
            </div>
         </div>

         <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {['ALL', 'CRITICAL', 'WARNING', 'INFO', 'SUCCESS'].map(f => (
               <button 
                  key={f} onClick={() => setFilter(f)}
                  style={{ 
                     background: filter === f ? 'rgba(34, 211, 238, 0.1)' : 'rgba(0,0,0,0.3)', 
                     color: filter === f ? '#22d3ee' : '#94a3b8', border: `1px solid ${filter === f ? 'rgba(34, 211, 238, 0.3)' : 'rgba(255,255,255,0.05)'}`, 
                     padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', whiteSpace: 'nowrap'
                  }}
               >
                  {f === 'CRITICAL' ? '🔴 ' : f === 'WARNING' ? '🟡 ' : f === 'SUCCESS' ? '🟢 ' : f === 'INFO' ? '🔵 ' : ''}{f}
               </button>
            ))}
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredAlerts.length === 0 ? (
               <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px dashed rgba(255,255,255,0.05)' }}>
                  No alerts matching "{filter}" priority. Check back later.
               </div>
            ) : (
               filteredAlerts.map(alert => (
                  <div key={alert.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: `4px solid ${getTypeColor(alert.type)}`, opacity: alert.read ? 0.6 : 1, transition: '0.3s' }}>
                     <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <div style={{ fontSize: '2rem', marginTop: '0.2rem' }}>{alert.icon}</div>
                        <div style={{ flex: 1 }}>
                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <div style={{ fontSize: '0.65rem', color: getTypeColor(alert.type), background: `${getTypeColor(alert.type)}20`, padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>{alert.type}</div>
                           </div>
                           <div style={{ fontSize: '1.05rem', color: alert.read ? '#94a3b8' : '#f1f5f9', fontWeight: alert.read ? 'normal' : 'bold', lineHeight: 1.4, marginBottom: '0.5rem' }}>{alert.msg}</div>
                           <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{alert.time} • {alert.fullTime}</div>
                           
                           {smartEnabled && !alert.read && alert.actionMsg && (
                              <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', background: 'rgba(139, 92, 246, 0.1)', border: '1px dashed rgba(139, 92, 246, 0.3)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                 <div style={{ fontSize: '0.8rem', color: '#c4b5fd' }}>🤖 <strong>AI FIX:</strong> {alert.actionMsg}</div>
                                 <button style={{ background: '#8b5cf6', border: 'none', color: 'white', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }} onMouseEnter={e => e.target.style.background = '#7c3aed'} onMouseLeave={e => e.target.style.background = '#8b5cf6'}>
                                    Apply Fix →
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                     
                     <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                        {!alert.read && (
                           <button onClick={() => handleMarkRead(alert.id)} style={{ background: 'transparent', border: '1px solid rgba(0, 255, 136, 0.3)', color: '#00ff88', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.target.style.background = 'rgba(0,255,136,0.1)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                              ✔ Mark as Read
                           </button>
                        )}
                        <button onClick={() => handleSnooze(alert.id)} style={{ background: 'transparent', border: '1px solid rgba(255, 184, 0, 0.3)', color: '#ffb800', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.target.style.background = 'rgba(255,184,0,0.1)'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                           🔁 Snooze
                        </button>
                        <button onClick={() => handleDismiss(alert.id)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }} onMouseEnter={e => e.target.style.color = '#ff4b4b'} onMouseLeave={e => e.target.style.color = '#94a3b8'}>
                           ❌ Dismiss
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
};

const SimulatorTabComponent = ({ sipMonthly, setSipMonthly, goals }) => {
   const [timePeriod, setTimePeriod] = useState(10);
   const [returnRate, setReturnRate] = useState(12);
   const [inflationAdjusted, setInflationAdjusted] = useState(false);

   const effectiveRate = inflationAdjusted ? Math.max(0, returnRate - 6) : returnRate;
   
   const monthlyRate = effectiveRate / 100 / 12;
   const months = timePeriod * 12;

   const totalInvested = sipMonthly * months;
   const finalValue = sipMonthly > 0 && monthlyRate > 0 ? (sipMonthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)) : totalInvested;
   const returnsEarned = finalValue - totalInvested;

   let riskLabel = { text: 'SAFE', color: '#00ff88', icon: '🟢' };
   if (returnRate > 14) riskLabel = { text: 'HIGH RISK', color: '#ff4b4b', icon: '🔴' };
   else if (returnRate >= 10) riskLabel = { text: 'MODERATE', color: '#ffb800', icon: '🟡' };

   let closestGoalMsg = "No active goals matched this trajectory.";
   if (goals && goals.length > 0) {
      const nearestGoal = goals.find(g => finalValue >= Number(g.target));
      if (nearestGoal) closestGoalMsg = `Projection exceeds "${nearestGoal.name}" target (₹${Number(nearestGoal.target).toLocaleString()}). Focus achieved.`;
      else {
          const closest = [...goals].sort((a,b) => a.target - b.target)[0];
          closestGoalMsg = `This trajectory covers ${Math.round((finalValue / closest.target) * 100)}% of your nearest goal: "${closest.name}".`;
      }
   }

   let aiMsg = "";
   if (inflationAdjusted && effectiveRate <= 2) {
      aiMsg = `Real return extremely low. You are losing purchasing power to inflation. Shift capital to higher yield diversified assets immediately.`;
   } else if (returnRate > 15) {
      aiMsg = `A ${returnRate}% return expects high volatility. Ensure this is only a fraction of your core portfolio. Options trading is heavily leveraged and risky.`;
   } else if (timePeriod < 10) {
      aiMsg = `Short horizon selected. If funding immediate needs, prioritize liquidity and capital preservation over aggressive yields.`;
   } else {
      const boostAmount = 1000;
      const boostValue = (sipMonthly + boostAmount) > 0 && monthlyRate > 0 ? ((sipMonthly + boostAmount) * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate)) : 0;
      const difference = boostValue - finalValue;
      aiMsg = `Stable exponential trajectory. Upping your monthly SIP by just ₹${boostAmount.toLocaleString()} generates an extra ₹${Math.round(difference).toLocaleString()} in pure exponential growth by Year ${timePeriod}.`;
   }

   const graphPoints = [];
   for (let i = 1; i <= timePeriod; i++) {
       const m = i * 12;
       const v = sipMonthly > 0 && monthlyRate > 0 ? (sipMonthly * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate)) : sipMonthly * m;
       graphPoints.push(v);
   }
   const maxGraphVal = graphPoints[graphPoints.length - 1] || 1;

   return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
         <div className="glass-card" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
               <h2 className="accent-text" style={{ fontSize: '1.2rem', margin: 0 }}>&gt; WEALTH_PROJECTION_ENGINE</h2>
               <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>ADJUST FOR INFLATION (6%)</span>
                  <div onClick={() => setInflationAdjusted(!inflationAdjusted)} style={{ width: '40px', height: '20px', background: inflationAdjusted ? '#ff4b4b' : 'rgba(255,255,255,0.1)', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                     <div style={{ position: 'absolute', top: '2px', left: inflationAdjusted ? '22px' : '2px', width: '16px', height: '16px', background: 'white', borderRadius: '50%', transition: '0.3s' }}></div>
                  </div>
               </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
               <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', fontWeight: 'bold' }}>MONTHLY_CONTRIBUTION (₹)</label>
                  <input type="number" value={sipMonthly || ''} onChange={e => setSipMonthly(Number(e.target.value))} className="auth-input" style={{ marginTop: '0.5rem', width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: '#f1f5f9', borderRadius: '8px', outline: 'none', transition: '0.3s' }} />
               </div>
               <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <label style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', fontWeight: 'bold' }}>EXPECTED_RETURN (%)</label>
                     <span style={{ fontSize: '0.65rem', color: riskLabel.color, fontWeight: 'bold' }}>{riskLabel.icon} {riskLabel.text}</span>
                  </div>
                  <input type="number" value={returnRate || ''} onChange={e => setReturnRate(Number(e.target.value))} className="auth-input" style={{ marginTop: '0.5rem', width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: '#f1f5f9', borderRadius: '8px', outline: 'none', transition: '0.3s' }} />
               </div>
               <div>
                  <label style={{ fontSize: '0.75rem', color: '#94a3b8', letterSpacing: '1px', fontWeight: 'bold' }}>TIME_HORIZON (YEARS)</label>
                  <select value={timePeriod} onChange={e => setTimePeriod(Number(e.target.value))} className="auth-input" style={{ marginTop: '0.5rem', width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '1rem', color: '#f1f5f9', borderRadius: '8px', outline: 'none', transition: '0.3s', cursor: 'pointer' }}>
                     <option value="5" style={{ background: '#0f172a' }}>5 Years</option>
                     <option value="10" style={{ background: '#0f172a' }}>10 Years</option>
                     <option value="15" style={{ background: '#0f172a' }}>15 Years</option>
                     <option value="20" style={{ background: '#0f172a' }}>20 Years</option>
                     <option value="25" style={{ background: '#0f172a' }}>25 Years</option>
                     <option value="30" style={{ background: '#0f172a' }}>30 Years</option>
                  </select>
               </div>
            </div>
         </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            <div className="glass-card hover-card-success" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', borderTop: '4px solid #00ff88' }}>
               <div style={{ fontSize: '0.8rem', color: '#94a3b8', letterSpacing: '1px', marginBottom: '1rem' }}>PROJECTED_FUTURE_VALUE</div>
               <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '2rem', color: '#00ff88' }}>₹</span>
                  <span style={{ fontSize: '4rem', fontWeight: '900', color: '#f1f5f9', lineHeight: 1, textShadow: '0 0 20px rgba(0,255,136,0.2)' }}>{Math.round(finalValue).toLocaleString()}</span>
               </div>
               
               <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>TOTAL_INVESTED</span>
                     <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#f1f5f9' }}>₹{Math.round(totalInvested).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>WEALTH_GENERATED</span>
                     <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#22d3ee' }}>+ ₹{Math.round(returnsEarned).toLocaleString()}</span>
                  </div>
               </div>

               {goals && goals.length > 0 && (
                  <div style={{ marginTop: '1.5rem', padding: '1rem 1.2rem', border: '1px solid rgba(34, 211, 238, 0.3)', borderRadius: '8px', background: 'rgba(34, 211, 238, 0.05)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <span style={{ fontSize: '1.5rem' }}>🔗</span>
                     <span style={{ fontSize: '0.85rem', color: '#22d3ee', fontWeight: 'bold', lineHeight: 1.4 }}>{closestGoalMsg}</span>
                  </div>
               )}
            </div>

            <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '0.85rem', color: '#c4b5fd', margin: 0, letterSpacing: '1px' }}>EXPONENTIAL_GROWTH_CURVE</h3>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' }}>YEAR 1 TO {timePeriod}</span>
               </div>
               <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: timePeriod > 15 ? '2px' : '6px', height: '220px', borderBottom: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)', padding: '10px 0 0 10px' }}>
                  {graphPoints.map((val, idx) => (
                     <div key={idx} style={{ flex: 1, height: `${(val / maxGraphVal) * 100}%`, background: `linear-gradient(180deg, #8b5cf6 0%, rgba(139, 92, 246, 0.2) 100%)`, borderTopLeftRadius: '4px', borderTopRightRadius: '4px', position: 'relative', transition: 'height 0.5s ease', minHeight: '1px' }} title={`Year ${idx + 1}: ₹${Math.round(val).toLocaleString()}`}>
                        {idx === graphPoints.length - 1 && (
                           <div style={{ position: 'absolute', top: '-25px', right: 0, fontSize: '0.65rem', color: '#f1f5f9', background: '#8b5cf6', padding: '2px 6px', borderRadius: '4px' }}>Max</div>
                        )}
                        <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.55rem', color: '#64748b' }}>
                           {(idx + 1) % 5 === 0 ? `Y${idx+1}` : ''}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* AI Strategy Node */}
         <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(34, 211, 238, 0.3)', background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.05) 0%, rgba(15, 23, 42, 0.5) 100%)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '1.5rem', background: 'rgba(34, 211, 238, 0.1)', padding: '0.8rem', borderRadius: '12px', border: '1px solid rgba(34, 211, 238, 0.2)' }}>🧠</div>
            <div>
               <h3 style={{ color: '#22d3ee', fontSize: '0.85rem', letterSpacing: '2px', margin: '0 0 0.8rem 0' }}>AI_STRATEGY_NODE</h3>
               <p style={{ fontSize: '1.05rem', color: '#f8fafc', margin: 0, lineHeight: 1.6, fontWeight: 300 }}>
                  {aiMsg}
               </p>
            </div>
         </div>
      </div>
   );
};

export default App

