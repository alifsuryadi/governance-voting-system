"use client";

import { useStacks } from "../hooks/use-stacks";
import { abbreviateAddress, formatSpt, formatStx } from "../lib/stx-utils";
import Link from "next/link";
import { useState } from "react";
import { Vote, Users, Wallet, Menu, X, PlusCircle, Home } from "lucide-react";

export function Navbar() {
  const { userData, stxBalance, sptBalance, connectWallet, disconnectWallet } =
    useStacks();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <Vote className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                DAO Governance
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/proposals"
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Vote className="w-4 h-4" />
              <span>Proposals</span>
            </Link>

            <Link
              href="/create-proposal"
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Proposal</span>
            </Link>

            <Link
              href="/governance"
              className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Users className="w-4 h-4" />
              <span>Governance</span>
            </Link>
          </div>

          {/* Desktop Wallet Section */}
          <div className="hidden md:flex items-center space-x-4">
            {userData ? (
              <div className="flex items-center space-x-4">
                {/* Balance Display */}
                <div className="flex items-center space-x-3 text-sm">
                  <div className="text-center">
                    <div className="text-gray-500 text-xs">STX</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatStx(stxBalance)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-500 text-xs">SPT</div>
                    <div className="font-medium text-primary-600 dark:text-primary-400">
                      {formatSpt(sptBalance)}
                    </div>
                  </div>
                </div>

                {/* User Address */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {abbreviateAddress(userData.profile.stxAddress.testnet)}
                  </span>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={disconnectWallet}
                  className="btn-secondary text-sm"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary text-sm flex items-center space-x-2"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white p-2"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              {/* Mobile Navigation Links */}
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/proposals"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Vote className="w-4 h-4" />
                <span>Proposals</span>
              </Link>

              <Link
                href="/create-proposal"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Proposal</span>
              </Link>

              <Link
                href="/governance"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users className="w-4 h-4" />
                <span>Governance</span>
              </Link>

              {/* Mobile Wallet Section */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {userData ? (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="px-3 py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <Wallet className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {abbreviateAddress(
                              userData.profile.stxAddress.testnet
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Connected</div>
                        </div>
                      </div>
                    </div>

                    {/* Balance Display */}
                    <div className="px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg mx-3">
                      <div className="flex justify-between items-center text-sm">
                        <div>
                          <div className="text-gray-500 text-xs">
                            STX Balance
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatStx(stxBalance)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-500 text-xs">
                            SPT Balance
                          </div>
                          <div className="font-medium text-primary-600 dark:text-primary-400">
                            {formatSpt(sptBalance)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Disconnect Button */}
                    <div className="px-3">
                      <button
                        onClick={disconnectWallet}
                        className="w-full btn-secondary text-sm"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="px-3">
                    <button
                      onClick={connectWallet}
                      className="w-full btn-primary text-sm flex items-center justify-center space-x-2"
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Connect Wallet</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
