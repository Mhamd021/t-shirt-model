"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../login/login.module.css";
import { register } from "../services/authService";


export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(""); 

  const validations = {
    name: (value) => value.length >= 3,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    password: (value) =>
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(value),
    confirmPassword: (value) => value === formData.password,
    terms: (value) => value,
  };

  const errorMessages = {
    name: "Name must be at least 3 characters",
    email: "Please enter a valid email address",
    password:
      "Password must contain: 8+ chars, uppercase, lowercase, number, and special character",
    confirmPassword: "Passwords do not match",
    terms: "You must accept the terms",
  };

  const handleInput = (field, value) => {
    const isValid = validations[field](value);
    setErrors((prev) => ({
      ...prev,
      [field]: isValid ? null : errorMessages[field],
    }));
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const isFormValid =
  Object.values(errors).every((error) => error === null) &&
  Object.values(validations).every((validate) => validate(formData));

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage(""); 
    const { name, email, password } = formData;

    const result = await register(name, email, password);
    if (result.success) {
      router.push("/shirtTool");
    } else {
      setErrorMessage(result.message); // Display server-side errors
    }
  };

  return (
    <main>
      <div className={styles.login}>
        <div className={`${styles.loginCard} ${styles.registerCard}`}>
          <label className={styles.headLabel}>Create Account</label>
          <form onSubmit={handleRegister}>
            <div className={styles.formContainer}>
              {/* Name Field */}
              <div className={styles.inputGroup}>
                <label > Name</label>
                <input
                  type="text"
                  className={
                    errors.name
                      ? styles.invalid
                      : formData.name
                      ? styles.valid
                      : ""
                  }
                  required
                  onChange={(e) => handleInput("name", e.target.value)}
                />
                {errors.name && (
                  <div className={styles.errorMessage}>{errors.name}</div>
                )}
              </div>

              {/* Email Field */}
              <div className={styles.inputGroup}>
                <label >Email</label>
                <input
                  type="email"
                  className={
                    errors.email
                      ? styles.invalid
                      : formData.email
                      ? styles.valid
                      : ""
                  }
                  required
                  onChange={(e) => handleInput("email", e.target.value)}
                />
                {errors.email && (
                  <div className={styles.errorMessage}>{errors.email}</div>
                )}
              </div>

              {/* Password Field */}
              <div className={styles.inputGroup}>
                <label >Password</label>
                <input
                  type="password"
                  className={
                    errors.password
                      ? styles.invalid
                      : formData.password
                      ? styles.valid
                      : ""
                  }
                  required
                  onChange={(e) => handleInput("password", e.target.value)}
                />
                {errors.password && (
                  <div className={styles.errorMessage}>{errors.password}</div>
                )}
              </div>

              {/* Confirm Password */}
              <div className={styles.inputGroup}>
                <label >Confirm Password</label>
                <input
                  type="password"
                  className={
                    errors.confirmPassword
                      ? styles.invalid
                      : formData.confirmPassword
                      ? styles.valid
                      : ""
                  }
                  required
                  onChange={(e) =>
                    handleInput("confirmPassword", e.target.value)
                  }
                />
                {errors.confirmPassword && (
                  <div className={styles.errorMessage}>
                    {errors.confirmPassword}
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className={styles.termsContainer}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.terms}
                  onChange={(e) => handleInput("terms", e.target.checked)}
                />
                <label htmlFor="terms">
                  I agree to our Terms and Privacy Policy
                </label>
                {errors.terms && (
                  <div className={styles.errorMessage}>{errors.terms}</div>
                )}
              </div>

              {/* Server Error Message */}
              {errorMessage && (
                <div className={styles.serverErrorMessage}>{errorMessage}</div>
              )}
            </div>

           <center>
           <button type="submit" disabled={
      Object.values(errors).some((error) => error !== null) ||
      Object.values(formData).some((value) => value === "" || value === false)
    }>
              Get Started
            </button>
           </center>
          </form>
        </div>
      </div>
    </main>
  );
}
