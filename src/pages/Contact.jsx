import React from 'react';
import ContactForm from '../components/contact/ContactForm';
import { motion } from 'framer-motion';
import { Instagram, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-brand-dark py-12 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-body text-sm tracking-[0.3em] text-brand-stone uppercase">
            Get In Touch
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-wider mt-4 text-brand-beige">
            CONTACT US
          </h1>
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="w-12 h-px bg-brand-stone" />
            <div className="w-1.5 h-1.5 bg-brand-stone rotate-45" />
            <div className="w-12 h-px bg-brand-stone" />
          </div>
          <p className="font-body text-brand-stone mt-6 max-w-xl mx-auto">
            Have a question or want to collaborate? We'd love to hear from you. 
            Drop us a message and we'll get back to you as soon as possible.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Image */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"
                alt="Mountains landscape"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="font-display text-2xl tracking-wider text-brand-beige">
                  JOIN THE TRIBE
                </h3>
                <p className="font-body text-sm text-brand-stone mt-1">
                  Connect with fellow primal spirits
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-6">
              {/* Instagram */}
              <a
                href="https://www.instagram.com/neanderthal_clothing_uk/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 p-6 bg-brand-forest border border-brand-rust hover:border-brand-stone transition-colors"
              >
                <div className="w-12 h-12 bg-brand-rust rounded-full flex items-center justify-center group-hover:bg-brand-stone transition-colors">
                  <Instagram className="w-5 h-5 text-brand-light-gray group-hover:text-brand-dark transition-colors" />
                </div>
                <div>
                  <h4 className="font-display text-lg tracking-wider text-brand-beige">
                    INSTAGRAM
                  </h4>
                  <p className="font-body text-brand-stone group-hover:text-brand-beige transition-colors">
                    @neanderthal_clothing_uk
                  </p>
                  <p className="font-body text-sm text-brand-stone/70 mt-1">
                    Follow us for the latest drops and primal content
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:info@neanderthalclothing.uk"
                className="group flex items-start gap-4 p-6 bg-brand-forest border border-brand-rust hover:border-brand-stone transition-colors"
              >
                <div className="w-12 h-12 bg-brand-rust rounded-full flex items-center justify-center group-hover:bg-brand-stone transition-colors">
                  <Mail className="w-5 h-5 text-brand-light-gray group-hover:text-brand-dark transition-colors" />
                </div>
                <div>
                  <h4 className="font-display text-lg tracking-wider text-brand-beige">
                    EMAIL
                  </h4>
                  <p className="font-body text-brand-stone group-hover:text-brand-beige transition-colors">
                    info@neanderthalclothing.uk
                  </p>
                  <p className="font-body text-sm text-brand-stone/70 mt-1">
                    For inquiries and collaborations
                  </p>
                </div>
              </a>

              {/* Location */}
              <div className="flex items-start gap-4 p-6 bg-brand-forest border border-brand-rust">
                <div className="w-12 h-12 bg-brand-rust rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-brand-light-gray" />
                </div>
                <div>
                  <h4 className="font-display text-lg tracking-wider text-brand-beige">
                    LOCATION
                  </h4>
                  <p className="font-body text-brand-stone">
                    United Kingdom
                  </p>
                  <p className="font-body text-sm text-brand-stone/70 mt-1">
                    Shipping worldwide
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="mb-6">
              <h3 className="font-display text-2xl tracking-wider text-brand-beige">
                SEND A MESSAGE
              </h3>
              <p className="font-body text-sm text-brand-stone mt-2">
                Fill out the form below and we'll respond within 24-48 hours.
              </p>
            </div>
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}