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
    <div className="bg-brand-forest border border-brand-rust p-6 sm:p-8 md:p-10">
      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-brand-rust rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-brand-light-gray" />
            </div>
            <h3 className="font-display text-2xl tracking-wider text-brand-beige mb-3">
              MESSAGE SENT
            </h3>
            <p className="font-body text-brand-stone mb-6">
              Thank you for reaching out. We'll get back to you soon.
            </p>
            <button
              onClick={() => setIsSubmitted(false)}
              className="font-body text-sm text-brand-light-gray underline underline-offset-4 hover:text-white transition-colors"
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
              <label htmlFor="contact-name" className="block font-body text-sm tracking-wider text-brand-stone uppercase mb-2">
                Name
              </label>
              <Input
                id="contact-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-brand-dark border-brand-rust text-brand-beige placeholder:text-brand-stone/60 font-body py-6 focus:border-brand-stone focus:ring-brand-stone"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="contact-email" className="block font-body text-sm tracking-wider text-brand-stone uppercase mb-2">
                Email
              </label>
              <Input
                id="contact-email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-brand-dark border-brand-rust text-brand-beige placeholder:text-brand-stone/60 font-body py-6 focus:border-brand-stone focus:ring-brand-stone"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block font-body text-sm tracking-wider text-brand-stone uppercase mb-2">
                Message
              </label>
              <Textarea
                id="contact-message"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-brand-dark border-brand-rust text-brand-beige placeholder:text-brand-stone/60 font-body min-h-[150px] focus:border-brand-stone focus:ring-brand-stone"
                placeholder="How can we help you?"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-stone hover:bg-brand-beige text-brand-dark font-display text-lg tracking-widest uppercase py-6 transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-brand-dark/30 border-t-brand-dark rounded-full animate-spin" />
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