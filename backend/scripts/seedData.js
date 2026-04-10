// backend/scripts/seedData.js
// Run:  node scripts/seedData.js
// Seeds realistic test data so every dashboard screen shows real values

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })
const mongoose = require('mongoose')
const { User, GameScore, ScribbleScore, Scheme, Alert, Feedback, Admin } = require('../models')

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function randDate(daysBack) {
  const d = new Date()
  d.setDate(d.getDate() - rand(0, daysBack))
  return d
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅  Connected to MongoDB:', process.env.MONGO_URI)

  // Clear existing seed data
  await Promise.all([
    User.deleteMany({}), GameScore.deleteMany({}), ScribbleScore.deleteMany({}),
    Scheme.deleteMany({}), Alert.deleteMany({}), Feedback.deleteMany({}), Admin.deleteMany({}),
  ])
  console.log('🧹  Cleared existing data')

  // ── Admin accounts ─────────────────────────────────────────
  await Admin.insertMany([
    { name: 'Super Admin',  email: 'superadmin@thirannexus.com', role: 'super_admin', status: 'Active', lastLogin: new Date() },
    { name: 'Priya S',      email: 'priya@thirannexus.com',      role: 'admin',       status: 'Active', lastLogin: randDate(3) },
    { name: 'Karan M',      email: 'karan@thirannexus.com',      role: 'moderator',   status: 'Active', lastLogin: randDate(7) },
    { name: 'Meena R',      email: 'meena@thirannexus.com',      role: 'support',     status: 'Inactive' },
  ])
  console.log('👤  Admin accounts seeded')

  // ── Users ─────────────────────────────────────────────────
  const disabilities  = ['visual','speech','cognitive','physical','hearing','other']
  const roles         = ['student','student','student','caregiver','parent']
  const states        = ['Tamil Nadu','Karnataka','Maharashtra','Delhi','Kerala','Andhra Pradesh']
  const educLevels    = ['Primary','Secondary','Higher Secondary','Graduate','Postgraduate']
  const userNames     = ['Anu Priya','Ramesh K','Sneha M','Arun Kumar','Divya P','Karan M','Lakshmi R','Vijay S','Preethi N','Suresh B','Meena J','Arjun T','Kavitha L','Balu R','Geetha S','Harish P','Indira V','Jeya K','Karthik M','Latha N']

  const users = await User.insertMany(userNames.map((name, i) => ({
    name,
    email:              `${name.toLowerCase().replace(/\s/g,'_')}_${i}@test.com`,
    role:               roles[i % roles.length],
    disabilityType:     disabilities[i % disabilities.length],
    disabilityPercentage: rand(20, 80),
    udid:               `UDID${String(i + 1).padStart(6,'0')}`,
    educationLevel:     educLevels[i % educLevels.length],
    state:              states[i % states.length],
    phone:              `9${rand(100000000,999999999)}`,
    isActive:           i < 16,
    createdAt:          randDate(90),
  })))
  console.log(`👥  ${users.length} users seeded`)

  // ── Game scores ────────────────────────────────────────────
  const gameScores = []
  for (const user of users) {
    const count = rand(3, 15)
    for (let i = 0; i < count; i++) {
      gameScores.push({
        userId:   user._id,
        gameType: Math.random() > 0.5 ? 'math' : 'twister',
        score:    rand(1, 10),
        playedAt: randDate(30),
      })
    }
  }
  await GameScore.insertMany(gameScores)
  console.log(`🎮  ${gameScores.length} game scores seeded`)

  // ── Scribble scores ────────────────────────────────────────
  const scribbleScores = []
  for (const user of users.slice(0, 15)) {
    for (let i = 0; i < rand(2, 8); i++) {
      scribbleScores.push({
        userId:     user._id,
        totalScore: rand(50, 500),
        rank:       rand(1, 6),
        playedAt:   randDate(30),
      })
    }
  }
  await ScribbleScore.insertMany(scribbleScores)
  console.log(`🖌️   ${scribbleScores.length} scribble scores seeded`)

  // ── Schemes ────────────────────────────────────────────────
  await Scheme.insertMany([
    { title: 'ADIP Scheme', description: 'Assistive Devices for Persons with Disabilities', disabilityType: 'visual', eligibility: ['Below poverty line', 'Age 5-80'], benefits: 'Free assistive device up to Rs 10,000', applyLink: 'https://adip.gov.in', lastDate: new Date('2025-03-31') },
    { title: 'NHFDC Loan Scheme', description: 'Loans for self-employment of persons with disabilities', disabilityType: 'physical', eligibility: ['Disability > 40%', 'Age 18-55'], benefits: 'Low interest loan up to Rs 25 lakh', applyLink: 'https://nhfdc.nic.in' },
    { title: 'Scholarship for Disabled Students', description: 'Pre and post matric scholarship', disabilityType: 'cognitive', eligibility: ['Disability > 40%', 'Family income < 2.5 lakh'], benefits: 'Up to Rs 12,000 per year' },
    { title: 'Braille Books Scheme', description: 'Free braille books for visually impaired students', disabilityType: 'visual', eligibility: ['Enrolled in school or college'], benefits: 'All prescribed textbooks in Braille free of cost' },
    { title: 'Digital Hearing Aid Scheme', description: 'Digital hearing aids for hearing impaired', disabilityType: 'hearing', eligibility: ['Hearing loss > 60dB', 'Age 6-60'], benefits: 'One hearing aid per ear, free replacement every 5 years', applyLink: 'https://adip.gov.in' },
    { title: 'Special Employment Exchange', description: 'Job placement services for persons with disabilities', disabilityType: 'other', eligibility: ['Any registered disability', 'Age 18-45'], benefits: 'Free job placement, interview coaching, skill training' },
  ])
  console.log('📚  Schemes seeded')

  // ── Alerts ─────────────────────────────────────────────────
  await Alert.insertMany([
    { userId: users[3]._id, userName: users[3].name, alert: 'Inactive for 3 days', type: 'Warning', severity: 'warning', status: 'Active' },
    { userId: users[4]._id, userName: users[4].name, alert: 'Low Performance (Math)', type: 'Info', severity: 'info', status: 'Active' },
    { userId: users[7]._id, userName: users[7].name, alert: 'Inactive for 3 days', type: 'Warning', severity: 'warning', status: 'Active' },
    { userId: users[1]._id, userName: users[1].name, alert: 'Unusual score drop detected', type: 'Critical', severity: 'critical', status: 'Active' },
    { userId: users[0]._id, userName: users[0].name, alert: 'Goal achieved: 30-day streak', type: 'Info', severity: 'info', status: 'Resolved', resolvedAt: new Date() },
    { userId: users[5]._id, userName: users[5].name, alert: 'Missed 4 scheduled sessions', type: 'Warning', severity: 'warning', status: 'Resolved', resolvedAt: new Date() },
  ])
  console.log('🚨  Alerts seeded')

  // ── Feedback ───────────────────────────────────────────────
  await Feedback.insertMany([
    { userId: users[0]._id, userName: users[0].name, subject: 'App not responding on voice mode', message: 'When I try to use the voice navigation the app freezes after 2 seconds. I am using Android 12.', category: 'Bug', status: 'Open' },
    { userId: users[1]._id, userName: users[1].name, subject: 'Need content in Tamil language', message: 'All the tongue twister content is only in English. Can you please add Tamil tongue twisters? It would help my child a lot.', category: 'Feature', status: 'In Progress', replies: [{ from: 'admin', message: 'Thank you for the suggestion! Tamil content is in our Q2 roadmap. We will notify you when it is live.', sentAt: new Date() }] },
    { userId: users[2]._id, userName: users[2].name, subject: 'Voice output is not clear', message: 'The text-to-speech voice sounds robotic and cuts off words. Hard to understand for my student.', category: 'Audio', status: 'Open' },
    { userId: users[4]._id, userName: users[4].name, subject: 'Excellent platform!', message: 'My daughter has improved so much using ThiranNexus. The games are engaging and the progress tracking is very helpful for parents. Thank you!', category: 'Feedback', status: 'Resolved', resolvedAt: new Date() },
    { userId: users[6]._id, userName: users[6].name, subject: 'Cannot login after password reset', message: 'I reset my password but the new password is not working. I tried 3 times and now my account seems locked.', category: 'Bug', status: 'Open' },
  ])
  console.log('💬  Feedback seeded')

  console.log('\n🎉  All data seeded successfully!')
  console.log('\n📊  Summary:')
  console.log(`   Users:         ${users.length}`)
  console.log(`   Game Scores:   ${gameScores.length}`)
  console.log(`   Scribble:      ${scribbleScores.length}`)
  console.log(`   Schemes:       6`)
  console.log(`   Alerts:        6`)
  console.log(`   Feedback:      5`)
  console.log(`   Admins:        4`)
  console.log('\n✅  Start the backend: npm run dev')
  process.exit(0)
}

seed().catch(err => {
  console.error('❌  Seed failed:', err.message)
  process.exit(1)
})