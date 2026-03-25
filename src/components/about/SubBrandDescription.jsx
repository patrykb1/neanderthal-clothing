import { motion } from 'framer-motion';

export function SubBrandDescription({title, description}) {
  return (
      <section className="py-16 sm:py-24 bg-[#1A1410]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=800&fit=crop"
                  alt="Forest"
                  className="w-full h-auto"
                />
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#8B7355] flex items-center justify-center">
                  <span className="font-display text-5xl text-[#0D0907]">N</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl sm:text-4xl tracking-wider text-[#D4C4A8]">
                {title}
              </h2>
              <div className="space-y-4 font-body text-[#8B7355] leading-relaxed">
                {description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
  );
}