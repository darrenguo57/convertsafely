/**
 * ConvertSafely - Privacy Policy Page
 * GDPR-compliant privacy policy with clear explanations
 */

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  FiShield,
  FiLock,
  FiEye,
  FiServer,
  FiGlobe,
  FiUser,
  FiMail,
  FiCalendar,
  FiCheckCircle,
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

// Key privacy points
const privacyHighlights = [
  {
    icon: FiLock,
    title: 'Local Processing',
    description: 'All file conversions happen in your browser. We never see your files.',
  },
  {
    icon: FiEye,
    title: 'No File Access',
    description: 'We cannot access, view, or analyze any files you convert.',
  },
  {
    icon: FiServer,
    title: 'Zero Storage',
    description: 'Files are never stored on our servers—ever.',
  },
  {
    icon: FiShield,
    title: 'GDPR Compliant',
    description: 'Full compliance with EU data protection regulations.',
  },
];

// Data we collect
const dataCollected = [
  {
    type: 'Account Information',
    icon: FiUser,
    items: ['Email address (if you create an account)', 'Subscription status', 'Usage limits tracking'],
    optional: true,
  },
  {
    type: 'Usage Data',
    icon: FiCalendar,
    items: ['Number of conversions (not file content)', 'Feature usage statistics', 'Error logs for debugging'],
    optional: false,
  },
  {
    type: 'Payment Information',
    icon: FiMail,
    items: ['Processed securely by Stripe', 'We never store credit card numbers', 'Billing history for your account'],
    optional: true,
  },
];

// GDPR rights
const gdprRights = [
  {
    right: 'Right to Access',
    description: 'You can request a copy of all personal data we hold about you.',
  },
  {
    right: 'Right to Rectification',
    description: 'You can correct any inaccurate or incomplete personal data.',
  },
  {
    right: 'Right to Erasure',
    description: 'You can request deletion of your personal data ("Right to be Forgotten").',
  },
  {
    right: 'Right to Restrict Processing',
    description: 'You can limit how we use your personal data in certain circumstances.',
  },
  {
    right: 'Right to Data Portability',
    description: 'You can receive your data in a structured, machine-readable format.',
  },
  {
    right: 'Right to Object',
    description: 'You can object to processing based on legitimate interests or direct marketing.',
  },
];

export default function Privacy() {
  const { t } = useTranslation();
  const lastUpdated = 'January 1, 2025';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            <motion.span
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 dark:bg-primary/20 text-primary text-sm font-medium mb-6"
            >
              <FiShield className="w-4 h-4" />
              Your Privacy Matters
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Privacy Policy
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-gray-600 dark:text-gray-400">
              Last updated: {lastUpdated}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Privacy Highlights */}
      <section className="py-16 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {privacyHighlights.map((item) => (
              <motion.div
                key={item.title}
                variants={fadeInUp}
                className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="prose dark:prose-invert max-w-none"
          >
            {/* Introduction */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                ConvertSafely (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy
                Policy explains how we collect, use, disclose, and safeguard your information when
                you use our file conversion service.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our core principle is simple: <strong>we cannot access your files because we never
                receive them.</strong> All file conversions happen locally in your browser using
                WebAssembly technology. This privacy-first architecture is fundamental to our service.
              </p>
            </motion.div>

            {/* File Processing */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. File Processing & Privacy
              </h2>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <FiCheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-emerald-900 dark:text-emerald-400 mb-2">
                      100% Local Processing
                    </h3>
                    <p className="text-emerald-800 dark:text-emerald-300 text-sm leading-relaxed">
                      All file conversions are performed entirely within your web browser. Your files
                      are never uploaded to our servers. We use WebAssembly and browser APIs to
                      process files locally on your device, ensuring complete privacy.
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Because all processing happens locally:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-2">
                <li>We cannot see the content of your files</li>
                <li>We cannot store copies of your files</li>
                <li>We cannot analyze or process your file data</li>
                <li>No file metadata is transmitted to our servers</li>
                <li>Converted files are immediately available for download from your browser</li>
              </ul>
            </motion.div>

            {/* Data We Collect */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. Information We Collect
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                We collect minimal data necessary to provide and improve our service:
              </p>

              <div className="space-y-6">
                {dataCollected.map((category) => (
                  <div
                    key={category.type}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                        <category.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{category.type}</h3>
                        {category.optional && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Optional - only if you create an account
                          </span>
                        )}
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {category.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm"
                        >
                          <FiCheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* How We Use Data */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. How We Use Your Information
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To process payments and manage subscriptions</li>
                <li>To enforce usage limits and prevent abuse</li>
                <li>To improve our service and user experience</li>
                <li>To communicate with you about your account or service updates</li>
                <li>To comply with legal obligations</li>
              </ul>
            </motion.div>

            {/* GDPR Section */}
            <motion.div variants={fadeInUp} className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <FiGlobe className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  5. GDPR Compliance
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                For users in the European Economic Area (EEA), we comply with the General Data
                Protection Regulation (GDPR). Your rights under GDPR include:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {gdprRights.map((right) => (
                  <div
                    key={right.right}
                    className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4"
                  >
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                      {right.right}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {right.description}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <p className="text-blue-800 dark:text-blue-300 text-sm">
                  <strong>Legal Basis:</strong> We process personal data based on legitimate
                  interests (service provision), contractual necessity (subscriptions), and consent
                  (where required). You can withdraw consent at any time.
                </p>
              </div>
            </motion.div>

            {/* Data Retention */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                6. Data Retention
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We retain your personal data only for as long as necessary to fulfill the purposes
                outlined in this Privacy Policy:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2 mt-2">
                <li>Account information: Retained until you delete your account</li>
                <li>Usage data: Retained for 12 months for analytics purposes</li>
                <li>Payment records: Retained for 7 years for legal compliance</li>
                <li>File conversion data: Never retained (files never reach our servers)</li>
              </ul>
            </motion.div>

            {/* Security */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                7. Security Measures
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We implement appropriate technical and organizational measures to protect your data:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>TLS encryption for all data transmission</li>
                <li>Secure payment processing via Stripe (PCI DSS compliant)</li>
                <li>Regular security audits and penetration testing</li>
                <li>Limited employee access to personal data</li>
                <li>Local processing architecture eliminates server-side file storage risks</li>
              </ul>
            </motion.div>

            {/* Third Parties */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                8. Third-Party Services
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  <strong>Stripe:</strong> Payment processing. Subject to Stripe&apos;s Privacy Policy.
                </li>
                <li>
                  <strong>Firebase:</strong> Authentication and database services. Subject to
                  Google&apos;s Privacy Policy.
                </li>
                <li>
                  <strong>Google AdSense:</strong> Advertising (free tier only). Subject to
                  Google&apos;s Advertising Policies.
                </li>
              </ul>
            </motion.div>

            {/* Children's Privacy */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                9. Children&apos;s Privacy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly
                collect personal information from children under 13. If you are a parent or guardian
                and believe your child has provided us with personal information, please contact us
                immediately.
              </p>
            </motion.div>

            {/* Changes */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any
                changes by posting the new policy on this page and updating the &quot;Last updated&quot;
                date. For significant changes, we will provide additional notice via email or
                prominent banner on our website.
              </p>
            </motion.div>

            {/* Contact */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                11. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or wish to exercise your privacy
                rights, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <p className="text-gray-900 dark:text-white font-medium">ConvertSafely</p>
                <p className="text-gray-600 dark:text-gray-400">Email: privacy@convertsafely.com</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Address: 123 Privacy Street, Tech City, TC 12345
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Data Protection Officer: dpo@convertsafely.com
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
