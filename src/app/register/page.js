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

  const handleRegister = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const { name, email, password } = formData;
    const result = await register(name, email, password);

    if (result.success) {
      router.push("/shirtTool");
      return;
    }

    setErrorMessage(result.message);
  };

  const isSubmitDisabled =
    Object.values(errors).some((error) => error !== null) ||
    Object.values(formData).some((value) => value === "" || value === false);

  return (
    <main>
      <div className={styles.login}>
        <div className={`${styles.loginCard} ${styles.registerCard}`}>
          <label className={styles.headLabel}>Create Account</label>
          {errorMessage && <div className={styles.serverErrorMessage}>{errorMessage}</div>}

          <form onSubmit={handleRegister}>
            <div className={styles.formContainer}>
              <div className={styles.registerField}>
                <label className={styles.inputLabel}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  placeholder="Your full name"
                  className={
                    errors.name ? styles.invalid : formData.name ? styles.valid : ""
                  }
                  required
                  onChange={(event) => handleInput("name", event.target.value)}
                />
                {errors.name && <div className={styles.errorMessage}>{errors.name}</div>}
              </div>

              <div className={styles.registerField}>
                <label className={styles.inputLabel}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  placeholder="example@domain.com"
                  className={
                    errors.email ? styles.invalid : formData.email ? styles.valid : ""
                  }
                  required
                  onChange={(event) => handleInput("email", event.target.value)}
                />
                {errors.email && <div className={styles.errorMessage}>{errors.email}</div>}
              </div>

              <div className={styles.registerField}>
                <label className={styles.inputLabel}>Password</label>
                <input
                  type="password"
                  value={formData.password}
                  placeholder="Create a strong password"
                  className={
                    errors.password ? styles.invalid : formData.password ? styles.valid : ""
                  }
                  required
                  onChange={(event) => handleInput("password", event.target.value)}
                />
                {errors.password && (
                  <div className={styles.errorMessage}>{errors.password}</div>
                )}
              </div>

              <div className={styles.registerField}>
                <label className={styles.inputLabel}>Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  placeholder="Re-enter your password"
                  className={
                    errors.confirmPassword
                      ? styles.invalid
                      : formData.confirmPassword
                        ? styles.valid
                        : ""
                  }
                  required
                  onChange={(event) => handleInput("confirmPassword", event.target.value)}
                />
                {errors.confirmPassword && (
                  <div className={styles.errorMessage}>{errors.confirmPassword}</div>
                )}
              </div>

              <div className={`${styles.termsContainer} ${styles.registerTerms}`}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.terms}
                  onChange={(event) => handleInput("terms", event.target.checked)}
                />
                <label htmlFor="terms">I agree to our Terms and Privacy Policy</label>
              </div>
              {errors.terms && <div className={styles.errorMessage}>{errors.terms}</div>}
            </div>

            <center>
              <button type="submit" disabled={isSubmitDisabled}>
                Get Started
              </button>
            </center>
          </form>
        </div>
      </div>
    </main>
  );
}
