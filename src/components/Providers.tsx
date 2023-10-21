"use client"
import { AnimatePresence } from 'framer-motion'
import { ThemeProvider } from 'next-themes'
import React from 'react'

const Providers = ({
    children,
}: {
    children: React.ReactNode
}) => {
    return (
        <ThemeProvider defaultTheme="dark" attribute="class">
            <AnimatePresence mode="wait">
                {children}
            </AnimatePresence>
        </ThemeProvider>
    )
}

export default Providers