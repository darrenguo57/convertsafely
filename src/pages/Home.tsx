/**
 * ConvertSafely - Home Page
 * Modern landing page with hero, features, converters grid, and pricing preview
 * Designed for North American/European users with privacy-first messaging
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
import { SUBSCRIPTION_PLANS, CURRENCY_CONFIG, getCurrencyForLang, getMonthlyPrice } from '@/types';

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
    titleKey: 'home.featurePrivate',
    descriptionKey: 'home.featurePrivateDesc',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FiZap,
    titleKey: 'home.featureFast',
    descriptionKey: 'home.featureFastDesc',
    color: 'from-amber-500 to-orange-600',
  },
  {
    icon: FiSmile,
    titleKey: 'home.featureEasy',
    descriptionKey: 'home.featureEasyDesc',
    color: 'from-blue-500 to-indigo-600',
  },
  {
    icon: FiAward,
    titleKey: 'home.featureQuality',
    descriptionKey: 'home.featureQualityDesc',
    color: 'from-purple-500 to-pink-600',
  },
];

// Converter tools
const converters = [
  {
    icon: FiImage,
    titleKey: 'home.imageTitle',
    descriptionKey: 'home.imageDesc',
    path: '/converter/image',
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    featureKeys: ['home.imageFeature1', 'home.imageFeature2', 'home.imageFeature3'],
  },
  {
    icon: FiFileText,
    titleKey: 'home.pdfTitle',
    descriptionKey: 'home.pdfDesc',
    path: '/converter/pdf',
    color: 'bg-gradient-to-br from-red-500 to-rose-600',
    featureKeys: ['home.pdfFeature1', 'home.pdfFeature2', 'home.pdfFeature3'],
  },
  {
    icon: FiVideo,
    titleKey: 'home.videoTitle',
    descriptionKey: 'home.videoDesc',
    path: '/converter/video',
    color: 'bg-gradient-to-br from-cyan-500 to-blue-600',
    featureKeys: ['home.videoFeature1', 'home.videoFeature2', 'home.videoFeature3'],
  },
  {
    icon: FiMusic,
    titleKey: 'home.audioTitle',
    descriptionKey: 'home.audioDesc',
    path: '/converter/audio',
    color: 'bg-gradient-to-br from-emerald-500 to-teal-600',
    featureKeys: ['home.audioFeature1', 'home.audioFeature2', 'home.audioFeature3'],
  },
];

// Trust badges
const trustBadges = [
  { icon: FiLock, textKey: 'home.noUploads' },
  { icon: FiServer, textKey: 'home.zeroStorage' },
  { icon: FiClock, textKey: 'home.instantProcessing' },
];

export default function Home() {
  const { t, i18n } = useTranslation();

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
                {t('home.trustBadge')}
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 tracking-tight"
            >
              {t('home.title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                Safely
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed"
            >
              {t('home.subtitle')}
              <span className="block mt-2 font-medium text-gray-900 dark:text-white">
                {t('home.subtitleHighlight')}
              </span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Link to="/converter/image">
                <Button size="lg" className="text-lg px-8 py-4 group">
                  {t('home.startConverting')}
                  <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button variant="outline" size="lg" className="text-lg px-8 py-4">
                  {t('home.viewPricing')}
                </Button>
              </Link>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
            >
              {trustBadges.map((badge) => (
                <div key={badge.textKey} className="flex items-center gap-2">
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span>{t(badge.textKey)}</span>
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
              {t('home.whyChoose')}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              {t('home.whySubtitle')}
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
                key={feature.titleKey}
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
                  {t(feature.titleKey)}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t(feature.descriptionKey)}
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
              {t('home.allInOne')}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              {t('home.allInOneSubtitle')}
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
              <motion.div key={converter.titleKey} variants={scaleIn}>
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
                          {t(converter.titleKey)}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                          {t(converter.descriptionKey)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {converter.featureKeys.map((fk) => (
                            <span
                              key={fk}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300"
                            >
                              <FiCheck className="w-3 h-3 text-primary" />
                              {t(fk)}
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
              {t('home.pricingTitle')}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
            >
              {t('home.pricingSubtitle')}
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
                      {t('home.mostPopular')}
                    </span>
                  </div>
                )}

                <div className={plan.id === 'pro' ? 'text-white' : 'text-gray-900 dark:text-white'}>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-4xl font-bold">
                      {CURRENCY_CONFIG[getCurrencyForLang(i18n.language)].symbol}{getMonthlyPrice(plan.id, getCurrencyForLang(i18n.language))}
                    </span>
                    <span
                      className={
                        plan.id === 'pro'
                          ? 'text-white/80'
                          : 'text-gray-500 dark:text-gray-400'
                      }
                    >
                      {t('home.perMonth')}
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
                          ? t('pricing.unlimited')
                          : plan.features.dailyConversions}{' '}
                        {t('home.conversionsPerDay')}
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
                        {t('home.upToMB', { size: plan.features.maxFileSize / (1024 * 1024) })}
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
                        {t('home.batchFiles', { count: plan.features.batchSize })}
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
                        {plan.features.noAds ? t('home.noAds') : t('home.adSupported')}
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
                      {plan.id === 'free' ? t('home.getStarted') : t('home.choosePlan')}
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
              {t('home.readyTitle')}
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto"
            >
              {t('home.readySubtitle')}
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link to="/converter/image">
                <Button size="lg" className="text-lg px-10 py-4 group">
                  {t('home.startNow')}
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
