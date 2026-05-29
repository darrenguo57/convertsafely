/**
 * ConvertSafely - Home Page
 * Modern landing page with hero, features, converters grid, and pricing preview
 * Designed for North American/European users with privacy-first messaging
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiImage,
  FiFileText,
  FiVideo,
  FiMusic,
  FiShield,
  FiZap,
  FiSmile,
  FiAward,
  FiArrowRight,
  FiCheck,
  FiLock,
  FiClock,
  FiServer,
} from 'react-icons/fi';
import { Button } from '@/components/ui/Button';
import { SUBSCRIPTION_PLANS } from '@/types';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
};

// Feature highlights
const features = [
  {
    icon: FiShield,
    title: '100% Private',
    description: 'All conversions happen locally in your browser. Your files never leave your device.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FiZap,
    title: 'Lightning Fast',
    description: 'Powered by WebAssembly for blazing-fast conversions without server delays.',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: FiSmile,
    title: 'Easy to Use',
    description: 'Drag, drop, and convert. No registration required. Simple as that.',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: FiAward,
    title: 'Premium Quality',
    description: 'High-fidelity conversions with advanced settings for professional results.',
    color: 'from-purple-500 to-pink-600',
  },
];

// Converter tools
const converters = [
  {
    icon: FiImage,
    title: 'Image Converter',
    description: 'JPG, PNG, WebP, GIF, AVIF, TIFF',
    path: '/converter/image',
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    features: ['Batch conversion', 'Quality control', 'Resize options'],
  },
  {
    icon: FiFileText,
    title: 'PDF Converter',
    description: 'PDF to Word, Excel, Images & more',
    path: '/converter/pdf',
    color: 'bg-gradient-to-br from-red-500 to-rose-600',
    features: ['Merge & split', 'Compress', 'Extract text'],
  },
  {
    icon: FiVideo,
    title: 'Video Converter',
    description: 'MP4, AVI, MOV, WebM, MKV',
    path: '/converter/video',
    color: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    features: ['Trim & crop', 'Codec options', 'Resolution'],
  },
  {
    icon: FiMusic,
    title: 'Audio Converter',
    description: 'MP3, WAV, AAC, OGG, FLAC',
    path: '/converter/audio',
    color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    features: ['Bitrate control', 'Trim audio', 'Metadata'],
  },
];

// Trust badges
const trustBadges = [
  { icon: FiLock, text: 'No Uploads Required' },
  { icon: FiServer, text: 'Zero Server Storage' },
  { icon: FiClock, text: 'Instant Processing' },
];

export default function Home() {
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            {/* Trust Badge */}
            <motion.div variants={fadeInUp} className="mb-8">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium border border-emerald-200 dark:border-emerald-800">
                <FiShield className="w-4 h-4" />
                Privacy-First File Conversion
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight"
            >
              Convert Files{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                Safely
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              Transform images, PDFs, videos, and audio files instantly in your browser.
              <span className="block mt-2 font-medium text-gray-900 dark:text-white">
                No uploads. No tracking. 100% private.
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link to="/converter/image">
                <Button size="lg" className="text-lg px-8 py-4 group">
                  Start Converting Free
                  <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
            >
              {trustBadges.map((badge) => (
                <div key={badge.text} className="flex items-center gap-2">
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span>{badge.text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full flex justify-center pt-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Why Choose ConvertSafely?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Built with privacy and performance at its core
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={scaleIn}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Converters Grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              All-in-One Conversion Tools
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Powerful converters for every file type you need
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            {converters.map((converter) => (
              <motion.div key={converter.title} variants={scaleIn}>
                <Link to={converter.path}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
                  >
                    <div className="flex items-start gap-6">
                      <div
                        className={`w-16 h-16 rounded-2xl ${converter.color} flex items-center justify-center flex-shrink-0`}
                      >
                        <converter.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                          {converter.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {converter.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {converter.features.map((feature) => (
                            <span
                              key={feature}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                            >
                              <FiCheck className="w-3 h-3 text-primary" />
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                      <FiArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Simple, Transparent Pricing
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Start free, upgrade when you need more
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <motion.div
                key={plan.id}
                variants={scaleIn}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={`relative rounded-2xl p-8 ${
                  plan.id === 'pro'
                    ? 'bg-gradient-to-b from-primary to-primary-dark text-white shadow-xl scale-105'
                    : 'bg-white dark:bg-gray-800 shadow-sm'
                }`}
              >
                {plan.id === 'pro' && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-amber-400 text-amber-900 text-sm font-bold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={plan.id === 'pro' ? 'text-white' : 'text-gray-900 dark:text-white'}>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold">
                      ${plan.price === 0 ? '0' : plan.price}
                    </span>
                    <span
                      className={
                        plan.id === 'pro'
                          ? 'text-white/80'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      /month
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-2">
                      <FiCheck
                        className={`w-5 h-5 ${
                          plan.id === 'pro' ? 'text-white' : 'text-primary'
                        }`}
                      />
                      <span
                        className={
                          plan.id === 'pro'
                            ? 'text-white/90'
                            : 'text-gray-600 dark:text-gray-400'
                        }
                      >
                        {plan.features.dailyConversions === -1
                          ? 'Unlimited'
                          : plan.features.dailyConversions}{' '}
                        conversions/day
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck
                        className={`w-5 h-5 ${
                          plan.id === 'pro' ? 'text-white' : 'text-primary'
                        }`}
                      />
                      <span
                        className={
                          plan.id === 'pro'
                            ? 'text-white/90'
                            : 'text-gray-600 dark:text-gray-400'
                        }
                      >
                        Up to {plan.features.maxFileSize / (1024 * 1024)}MB files
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck
                        className={`w-5 h-5 ${
                          plan.id === 'pro' ? 'text-white' : 'text-primary'
                        }`}
                      />
                      <span
                        className={
                          plan.id === 'pro'
                            ? 'text-white/90'
                            : 'text-gray-600 dark:text-gray-400'
                        }
                      >
                        Batch: {plan.features.batchSize} files
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <FiCheck
                        className={`w-5 h-5 ${
                          plan.id === 'pro' ? 'text-white' : 'text-primary'
                        }`}
                      />
                      <span
                        className={
                          plan.id === 'pro'
                            ? 'text-white/90'
                            : 'text-gray-600 dark:text-gray-400'
                        }
                      >
                        {plan.features.noAds ? 'No ads' : 'Ad supported'}
                      </span>
                    </li>
                  </ul>

                  <Link to="/pricing">
                    <Button
                      variant={plan.id === 'pro' ? 'outline' : 'primary'}
                      fullWidth
                      className={
                        plan.id === 'pro'
                          ? 'border-white text-white hover:bg-white hover:text-primary'
                          : ''
                      }
                    >
                      {plan.price === 0 ? 'Get Started' : 'Choose Plan'}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6"
            >
              Ready to Convert Safely?
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of users who trust ConvertSafely for their file conversion needs.
              No registration required.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/converter/image">
                <Button size="lg" className="text-lg px-10 py-4 group">
                  Start Converting Now
                  <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
