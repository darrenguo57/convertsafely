/**
 * ConvertSafely - About Page
 * Company introduction, privacy commitment, and technology stack
 */

import { motion } from 'framer-motion';
import {
  FiShield,
  FiLock,
  FiEye,
  FiServer,
  FiGlobe,
  FiCode,
  FiCpu,
  FiLayers,
  FiCheckCircle,
  FiUsers,
  FiHeart,
} from 'react-icons/fi';

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

// Privacy commitments
const privacyCommitments = [
  {
    icon: FiLock,
    title: 'Local Processing Only',
    description:
      'All file conversions happen entirely within your browser using WebAssembly. Your files never leave your device, ensuring complete privacy.',
  },
  {
    icon: FiEye,
    title: 'Zero Data Collection',
    description:
      'We do not collect, store, or analyze your files. We cannot see what you convert, and we do not want to. Your data belongs to you alone.',
  },
  {
    icon: FiServer,
    title: 'No Cloud Storage',
    description:
      'Unlike other conversion services, we have zero server-side storage. There is no cloud to breach, no database to hack, no backups to worry about.',
  },
  {
    icon: FiGlobe,
    title: 'GDPR Compliant',
    description:
      'We respect your privacy rights under GDPR and other global privacy regulations. No tracking cookies, no analytics without consent.',
  },
];

// Technology stack
const technologies = [
  {
    category: 'Frontend',
    icon: FiCode,
    items: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    category: 'Conversion Engine',
    icon: FiCpu,
    items: ['FFmpeg.wasm', 'pdf-lib', 'WebAssembly', 'Canvas API', 'Web Workers'],
    color: 'from-purple-500 to-pink-500',
  },
  {
    category: 'Infrastructure',
    icon: FiLayers,
    items: ['Firebase Hosting', 'Cloud Functions', 'Stripe Payments', 'Firestore'],
    color: 'from-emerald-500 to-teal-500',
  },
];

// Company values
const values = [
  {
    icon: FiShield,
    title: 'Privacy First',
    description: 'We believe privacy is a fundamental right, not a premium feature.',
  },
  {
    icon: FiCheckCircle,
    title: 'Quality Matters',
    description: 'Every conversion maintains the highest possible quality standards.',
  },
  {
    icon: FiUsers,
    title: 'User-Centric',
    description: 'Designed for real people, with intuitive interfaces and clear workflows.',
  },
  {
    icon: FiHeart,
    title: 'Open & Honest',
    description: 'Transparent pricing, clear policies, and no hidden surprises.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm font-medium mb-6"
            >
              <FiShield className="w-4 h-4" />
              About ConvertSafely
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight"
            >
              Privacy-First File Conversion
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
            >
              We are on a mission to make file conversion safe, fast, and accessible to everyone.
              No uploads, no tracking, no compromises.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12 items-center"
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                <p>
                  ConvertSafely was born from a simple frustration: every file conversion service
                  required uploading files to remote servers, creating unnecessary privacy risks and
                  security vulnerabilities.
                </p>
                <p>
                  We asked ourselves: Why can&apos;t file conversion happen entirely in the browser?
                  With the advent of WebAssembly and powerful browser APIs, we realized it was not
                  only possible but could be faster and more secure than server-based alternatives.
                </p>
                <p>
                  Today, ConvertSafely processes millions of conversions monthly, all without ever
                  touching a single file on our servers. We have proven that privacy and convenience
                  can coexist.
                </p>
              </div>
            </motion.div>
            <motion.div
              variants={fadeInUp}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                By the Numbers
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">10M+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Files Converted</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Files Stored</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">150+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Countries</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="text-3xl font-bold text-primary mb-1">99.9%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Privacy Commitment Section */}
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
              Our Privacy Promise
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Privacy is not an afterthought—it is the foundation of everything we build
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 gap-8"
          >
            {privacyCommitments.map((commitment) => (
              <motion.div
                key={commitment.title}
                variants={fadeInUp}
                className="flex gap-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <commitment.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {commitment.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {commitment.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Technology Stack Section */}
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
              Technology Stack
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              Built with modern, open-source technologies for maximum performance and reliability
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {technologies.map((tech) => (
              <motion.div
                key={tech.category}
                variants={fadeInUp}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center mb-6`}
                >
                  <tech.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  {tech.category}
                </h3>
                <ul className="space-y-2">
                  {tech.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
                    >
                      <FiCheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
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
              Our Values
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              The principles that guide every decision we make
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value) => (
              <motion.div
                key={value.title}
                variants={fadeInUp}
                className="text-center p-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Get in Touch
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 mb-8"
            >
              Have questions or feedback? We would love to hear from you.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href="mailto:support@convertsafely.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
              >
                Contact Support
              </a>
              <a
                href="https://twitter.com/convertsafely"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Follow on Twitter
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
