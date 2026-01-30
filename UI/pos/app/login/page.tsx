"use client";

import { useState } from "react";
import { FaUser, FaLock, FaSignInAlt, FaGoogle, FaFacebookF } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"error" | "success">("error");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    // Prepare the data to match your Spring Boot UserDto
    const data = { 
      email: username, 
      password 
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`
        
      , {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Store the token if returned in the response
        const tokenToStore = result.jwt || result.token;
        if (tokenToStore) {
          localStorage.setItem("token", tokenToStore);
          console.log("Token saved successfully!");
        }
        else{
          console.error("No token found in response:", result);
        }
        
        // Store user info if available
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
        }

        setMessage(result.message || "Login successful! Redirecting...");
        setMessageType("success");

        // Redirect based on user role
        setTimeout(() => {
          // Check if user is admin (you may need to adjust this based on your actual response structure)
          if (result.user && result.user.role === "ROLE_ADMIN") {
            window.location.href = "/admin";
          } else {
            window.location.href = "/cashier";
          }
        }, 1500);
      } else {
        setMessage(result.message || result.error || "Login failed. Please check your credentials.");
        setMessageType("error");
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage("A network error occurred. Please check your connection and ensure the backend is running.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slide-in" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
      <div className="card" style={{ 
        display: 'flex', 
        maxWidth: 900, 
        width: '100%', 
        background: '#fff', 
        borderRadius: 16, 
        overflow: 'hidden', 
        boxShadow: '0 8px 32px rgba(5,150,105,0.15)',
        margin: '2rem'
      }}>
        <div className="image-side" style={{ flex: 1, position: 'relative', minHeight: 400 }}>
          <Image 
            src="/images/groceries.jpeg" 
            alt="Groceries" 
            fill
            style={{ objectFit: 'cover' }}
            className="main-image" 
          />
        </div>
        <div className="form-side" style={{ flex: 1, padding: '3rem 2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="title-with-logo" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32, justifyContent: 'center' }}>
            <Image 
              src="/images/logo.jpeg" 
              alt="Logo" 
              width={50} 
              height={50} 
              className="title-logo" 
              style={{ borderRadius: 8 }}
            />
            <h1 style={{ 
              fontSize: 28, 
              fontWeight: 800, 
              color: '#059669', 
              letterSpacing: 1.5,
              margin: 0
            }}>
              ESIT GROCERIES
            </h1>
          </div>

          {message && (
            <div style={{ 
              padding: '12px 16px', 
              borderRadius: 8, 
              marginBottom: 20,
              background: messageType === "success" ? '#dcfce7' : '#fee2e2',
              color: messageType === "success" ? '#059669' : '#dc2626',
              border: `1px solid ${messageType === "success" ? '#bbf7d0' : '#fecaca'}`,
              textAlign: 'center',
              fontWeight: 600
            }}>
              {message}
            </div>
          )}

          <form id="login-form" onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: 20, position: 'relative' }}>
              <input
                type="text"
                id="email"
                name="email"
                placeholder="Email Address or Username"
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '14px 16px 14px 48px', 
                  borderRadius: 8, 
                  border: '1.5px solid #d1d5db',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <FaUser className="icon" style={{ 
                position: 'absolute', 
                left: 16, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                fontSize: 18
              }} />
            </div>

            <div className="form-group" style={{ marginBottom: 24, position: 'relative' }}>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '14px 16px 14px 48px', 
                  borderRadius: 8, 
                  border: '1.5px solid #d1d5db',
                  fontSize: 16,
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#16a34a'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              <FaLock className="icon" style={{ 
                position: 'absolute', 
                left: 16, 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                fontSize: 18
              }} />
            </div>

            <button 
              type="submit" 
              className="btn" 
              disabled={loading}
              style={{ 
                width: '100%',
                padding: '14px 24px',
                background: loading ? '#9ca3af' : 'linear-gradient(90deg, #059669 0%, #16a34a 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                fontSize: 18,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                transition: 'all 0.2s',
                letterSpacing: 0.5
              }}
            >
              {loading ? 'Logging in...' : 'Login'} 
              {!loading && <FaSignInAlt className="arrow-icon" />}
            </button>
          </form>

          {/* <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Link 
              href="/forgot-password" 
              style={{ 
                color: '#16a34a', 
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 600
              }}
            >
              Forgot Password?
            </Link>
          </div> */}

          {/* <div style={{ marginTop: 32, textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>
              Don't have an account?{' '}
              <Link 
                href="/signup" 
                style={{ 
                  color: '#16a34a', 
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Sign Up
              </Link>
            </p>
          </div> */}
        </div>
      </div>
    </div>
  );
}