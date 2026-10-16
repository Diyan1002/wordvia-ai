"use client";

import Link from "next/link";
import { useState } from "react";
import { Sparkles, Menu, X } from "lucide-react";

import {
  UserButton,
  SignInButton,
  useAuth,
} from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav
      className="
        sticky
        top-0
        z-50
        w-full
        bg-white/80
        backdrop-blur-md
        border-b
      "
    >
      <div
        className="
          px-4
          sm:px-6
          md:px-12
          py-4
          sm:py-5
        "
      >
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="
              flex
              items-center
              gap-2
              text-xl
              sm:text-2xl
              font-bold
              text-gray-900
            "
          >
            <Sparkles className="w-6 h-6 text-purple-600" />
            <span>Wordvia.ai</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            
            <Link
              href="/humanizer"
              className="
                text-gray-700
                hover:text-purple-600
                transition-colors
                duration-200
              "
            >
              Humanizer
            </Link>

            <Link
              href="/pricing"
              className="
                text-gray-700
                hover:text-purple-600
                transition-colors
                duration-200
              "
            >
              Pricing
            </Link>

            {/* Signed Out */}
            {!isSignedIn && (
              <SignInButton>
                <button
                  className="
                    border
                    border-gray-200
                    px-5
                    py-2
                    rounded-xl
                    text-gray-700
                    hover:border-purple-300
                    hover:text-purple-600
                    hover:bg-purple-50
                    transition-all
                    duration-200
                  "
                >
                  Login
                </button>
              </SignInButton>
            )}

            {/* Signed In */}
            {isSignedIn && (
              <>
                <Link
                  href="/dashboard"
                  className="
                    text-gray-700
                    hover:text-purple-600
                    transition-colors
                    duration-200
                  "
                >
                  Dashboard
                </Link>

                <UserButton />
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="
              md:hidden
              p-2
              rounded-lg
              text-gray-700
              hover:bg-purple-50
              hover:text-purple-600
              transition
            "
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className="
              md:hidden
              mt-4
              pt-4
              border-t
              border-gray-100
              pb-2
            "
          >
            <div className="flex flex-col gap-2">

              {/* Humanizer */}
              <Link
                href="/humanizer"
                onClick={closeMenu}
                className="
                  px-4
                  py-3
                  rounded-xl
                  text-gray-700
                  hover:bg-purple-50
                  hover:text-purple-600
                  transition
                "
              >
                Humanizer
              </Link>

              {/* Pricing */}
              <Link
                href="/pricing"
                onClick={closeMenu}
                className="
                  px-4
                  py-3
                  rounded-xl
                  text-gray-700
                  hover:bg-purple-50
                  hover:text-purple-600
                  transition
                "
              >
                Pricing
              </Link>

              {/* Signed Out */}
              {!isSignedIn && (
                <SignInButton>
                  <button
                    className="
                      w-full
                      mt-2
                      border
                      border-gray-200
                      px-5
                      py-3
                      rounded-xl
                      text-gray-700
                      hover:border-purple-300
                      hover:bg-purple-50
                      hover:text-purple-600
                      transition
                    "
                  >
                    Login
                  </button>
                </SignInButton>
              )}

              {/* Signed In */}
              {isSignedIn && (
                <>
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="
                      px-4
                      py-3
                      rounded-xl
                      text-gray-700
                      hover:bg-purple-50
                      hover:text-purple-600
                      transition
                    "
                  >
                    Dashboard
                  </Link>

                  <div
                    className="
                      flex
                      items-center
                      gap-3
                      px-4
                      py-3
                    "
                  >
                    <UserButton />
                    <span className="text-sm text-gray-600">
                      Account
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}