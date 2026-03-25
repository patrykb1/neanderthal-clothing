import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="bg-[#1A1410] border border-[#2C1810] p-6 sm:p-8 md:p-10">
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-[#1A3D2E] rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-[#D4C4A8]" />
            </div>
            <h3 className="font-display text-2xl tracking-wider text-[#D4C4A8] mb-3">
              MESSAGE SENT
            </h3>
            <p className="font-body text-[#8B7355] mb-6">
              Thank you for reaching out. We'll get back to you soon.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="font-body text-sm text-[#D4C4A8] underline underline-offset-4 hover:text-white transition-colors"
            >
              Send another message
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block font-body text-sm tracking-wider text-[#8B7355] uppercase mb-2">
                Name
              </label>
              <Input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#0D0907] border-[#2C1810] text-[#D4C4A8] placeholder:text-[#8B7355]/50 font-body py-6 focus:border-[#8B7355] focus:ring-[#8B7355]"
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block font-body text-sm tracking-wider text-[#8B7355] uppercase mb-2">
                Email
              </label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#0D0907] border-[#2C1810] text-[#D4C4A8] placeholder:text-[#8B7355]/50 font-body py-6 focus:border-[#8B7355] focus:ring-[#8B7355]"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block font-body text-sm tracking-wider text-[#8B7355] uppercase mb-2">
                Message
              </label>
              <Textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-[#0D0907] border-[#2C1810] text-[#D4C4A8] placeholder:text-[#8B7355]/50 font-body min-h-[150px] focus:border-[#8B7355] focus:ring-[#8B7355]"
                placeholder="How can we help you?"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#8B7355] hover:bg-[#D4C4A8] text-[#0D0907] font-display text-lg tracking-widest uppercase py-6 transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-[#0D0907]/30 border-t-[#0D0907] rounded-full animate-spin" />
                  Sending...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Send Message
                  <Send className="w-5 h-5" />
                </span>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}