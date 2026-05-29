/**
 * ConvertSafely - Terms of Service Page
 * Comprehensive terms of service agreement
 */

import { motion } from 'framer-motion';
import { FiFileText, FiAlertCircle, FiCheckCircle, FiShield, FiDollarSign } from 'react-icons/fi';

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

// Key terms highlights
const termHighlights = [
  {
    icon: FiShield,
    title: 'Privacy First',
    description: 'Your files are processed locally. We never see or store them.',
  },
  {
    icon: FiCheckCircle,
    title: 'Fair Use',
    description: 'Use our service reasonably. No abuse, no automation without permission.',
  },
  {
    icon: FiDollarSign,
    title: 'Transparent Pricing',
    description: 'Clear pricing with no hidden fees. Cancel anytime.',
  },
  {
    icon: FiAlertCircle,
    title: 'As-Is Service',
    description: 'Service provided without warranties. Use at your own risk.',
  },
];

export default function Terms() {
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
              <FiFileText className="w-4 h-4" />
              Legal Agreement
            </motion.span>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4"
            >
              Terms of Service
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-gray-600 dark:text-gray-400">
              Last updated: {lastUpdated}
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {termHighlights.map((item) => (
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
            {/* Agreement */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                1. Agreement to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                By accessing or using ConvertSafely (&quot;Service&quot;), you agree to be bound by these
                Terms of Service (&quot;Terms&quot;). If you disagree with any part of the terms, you may
                not access the Service.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                These Terms constitute a legally binding agreement between you and ConvertSafely
                regarding your use of the Service. Please read them carefully.
              </p>
            </motion.div>

            {/* Description */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                2. Description of Service
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                ConvertSafely is a browser-based file conversion service that allows users to
                convert files between various formats. Key characteristics of our Service include:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>
                  <strong>Local Processing:</strong> All file conversions are performed locally in
                  your browser using WebAssembly technology
                </li>
                <li>
                  <strong>No File Uploads:</strong> Your files are never uploaded to our servers
                </li>
                <li>
                  <strong>Privacy-First:</strong> We cannot access, view, or store your files
                </li>
                <li>
                  <strong>Multiple Formats:</strong> Support for images, PDFs, videos, and audio
                  files
                </li>
              </ul>
            </motion.div>

            {/* Accounts */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                3. User Accounts
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                When you create an account with us, you must provide accurate, complete, and current
                information. Failure to do so constitutes a breach of the Terms, which may result
                in immediate termination of your account.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                You are responsible for safeguarding the password and for all activities that occur
                under your account. You agree to notify us immediately of any unauthorized access
                to or use of your account.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                You may not use as a username the name of another person or entity that is not
                lawfully available for use, or a name or trademark that is subject to any rights of
                another person or entity without appropriate authorization.
              </p>
            </motion.div>

            {/* Acceptable Use */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                4. Acceptable Use
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                You agree to use the Service only for lawful purposes and in accordance with these
                Terms. You agree not to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Use the Service in any way that violates applicable laws or regulations</li>
                <li>
                  Use the Service to convert files containing illegal content, malware, or viruses
                </li>
                <li>Attempt to bypass any usage limits or restrictions</li>
                <li>Use automated scripts, bots, or scrapers without our written permission</li>
                <li>Interfere with or disrupt the Service or servers connected to the Service</li>
                <li>Attempt to reverse engineer or extract source code from the Service</li>
                <li>Use the Service to infringe on intellectual property rights</li>
                <li>Share account credentials or allow others to use your account</li>
              </ul>
            </motion.div>

            {/* Subscription & Payment */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                5. Subscriptions and Payments
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Some parts of the Service are billed on a subscription basis. You will be billed
                in advance on a recurring basis depending on the type of subscription plan you
                select.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                <strong>Free Tier:</strong> Available at no cost with limitations on file size,
                number of conversions, and supported by advertising.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                <strong>Paid Subscriptions:</strong> Provide enhanced features including larger file
                sizes, more conversions, batch processing, and ad-free experience.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                <strong>Billing:</strong> All payments are processed securely through Stripe. We do
                not store your credit card information.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>Cancellation:</strong> You may cancel your subscription at any time. Your
                subscription will remain active until the end of the current billing period. No
                refunds will be provided for partial months.
              </p>
            </motion.div>

            {/* Usage Limits */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                6. Usage Limits
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We enforce usage limits based on your subscription tier to ensure fair use and
                service quality:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Free tier: Limited daily conversions and file size</li>
                <li>Pro tier: Expanded limits with priority processing</li>
                <li>Enterprise tier: Highest limits with API access</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                We reserve the right to modify usage limits at any time with reasonable notice to
                subscribers.
              </p>
            </motion.div>

            {/* Intellectual Property */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                7. Intellectual Property
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                The Service and its original content, features, and functionality are and will
                remain the exclusive property of ConvertSafely and its licensors. The Service is
                protected by copyright, trademark, and other laws.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                <strong>Your Content:</strong> You retain all rights to the files you convert using
                our Service. We claim no ownership over your content. Since files are processed
                locally, we never have access to them.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>Feedback:</strong> Any feedback you provide regarding the Service may be
                used by us without restriction or compensation to you.
              </p>
            </motion.div>

            {/* Disclaimer */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                8. Disclaimer of Warranties
              </h2>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 mb-4">
                <p className="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
                  THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT
                  WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
                  IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR
                  NON-INFRINGEMENT.
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We do not warrant that:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>The Service will function uninterrupted, secure, or available at any particular time</li>
                <li>Any errors or defects will be corrected</li>
                <li>The Service is free of viruses or other harmful components</li>
                <li>The results of using the Service will meet your requirements</li>
              </ul>
            </motion.div>

            {/* Limitation of Liability */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                In no event shall ConvertSafely, its directors, employees, partners, agents,
                suppliers, or affiliates be liable for any indirect, incidental, special,
                consequential, or punitive damages, including without limitation, loss of profits,
                data, use, goodwill, or other intangible losses, resulting from:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-2">
                <li>Your access to or use of or inability to access or use the Service</li>
                <li>Any conduct or content of any third party on the Service</li>
                <li>Any content obtained from the Service</li>
                <li>Unauthorized access, use, or alteration of your transmissions or content</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                Our total liability to you for all claims arising from or relating to these Terms
                or your use of the Service shall not exceed the amount you paid us, if any, during
                the 12 months preceding the event giving rise to liability.
              </p>
            </motion.div>

            {/* Indemnification */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                10. Indemnification
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                You agree to defend, indemnify, and hold harmless ConvertSafely and its licensees
                and licensors, and their employees, contractors, agents, officers, and directors,
                from and against any and all claims, damages, obligations, losses, liabilities,
                costs or debt, and expenses arising from your use of and access to the Service,
                or your violation of any term of these Terms.
              </p>
            </motion.div>

            {/* Termination */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                11. Termination
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                We may terminate or suspend your account immediately, without prior notice or
                liability, for any reason whatsoever, including without limitation if you breach
                the Terms.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                Upon termination, your right to use the Service will immediately cease. If you
                wish to terminate your account, you may simply discontinue using the Service or
                delete your account through the settings page.
              </p>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                All provisions of the Terms which by their nature should survive termination shall
                survive termination, including, without limitation, ownership provisions, warranty
                disclaimers, indemnity, and limitations of liability.
              </p>
            </motion.div>

            {/* Governing Law */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                12. Governing Law
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                These Terms shall be governed and construed in accordance with the laws of the
                United States and the State of Delaware, without regard to its conflict of law
                provisions. Our failure to enforce any right or provision of these Terms will not
                be considered a waiver of those rights.
              </p>
            </motion.div>

            {/* Changes */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                13. Changes to Terms
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at
                any time. If a revision is material, we will try to provide at least 30 days&apos;
                notice prior to any new terms taking effect. What constitutes a material change
                will be determined at our sole discretion. By continuing to access or use our
                Service after those revisions become effective, you agree to be bound by the
                revised terms.
              </p>
            </motion.div>

            {/* Contact */}
            <motion.div variants={fadeInUp} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                14. Contact Us
              </h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <p className="text-gray-900 dark:text-white font-medium">ConvertSafely</p>
                <p className="text-gray-600 dark:text-gray-400">Email: legal@convertsafely.com</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Address: 123 Privacy Street, Tech City, TC 12345
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
