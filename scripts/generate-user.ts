#!/usr/bin/env npx tsx

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'
import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from apps/web/.env.local or root .env
config({ path: resolve(__dirname, '../apps/web/.env.local') })
config({ path: resolve(__dirname, '../.env') })

const BCRYPT_ROUNDS = 12

interface Args {
  admin: boolean
  email: string
  password: string
}

function parseArgs(): Args {
  const args = process.argv.slice(2)
  const result: Args = {
    admin: false,
    email: '',
    password: '',
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--admin':
        result.admin = true
        break
      case '--email':
        result.email = args[++i]
        break
      case '--password':
        result.password = args[++i]
        break
    }
  }

  return result
}

function validateArgs(args: Args): void {
  if (!args.email) {
    console.error('Error: --email is required')
    console.error('Usage: npx tsx scripts/generate-user.ts --admin --email <email> --password <password>')
    process.exit(1)
  }

  if (!args.password) {
    console.error('Error: --password is required')
    console.error('Usage: npx tsx scripts/generate-user.ts --admin --email <email> --password <password>')
    process.exit(1)
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(args.email)) {
    console.error('Error: Invalid email format')
    process.exit(1)
  }

  if (args.password.length < 8) {
    console.error('Error: Password must be at least 8 characters')
    process.exit(1)
  }
}

async function main() {
  const args = parseArgs()
  validateArgs(args)

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    console.error('Make sure you have a .env file with these variables')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  console.log(`Creating ${args.admin ? 'admin' : 'regular'} user: ${args.email}`)

  // Hash password
  const passwordHash = await bcrypt.hash(args.password, BCRYPT_ROUNDS)

  // Insert user
  const { data, error } = await supabase
    .from('admins')
    .insert({
      email: args.email.toLowerCase(),
      password_hash: passwordHash,
      is_admin: args.admin,
    })
    .select('id, email, is_admin')
    .single()

  if (error) {
    if (error.code === '23505') {
      console.error(`Error: User with email ${args.email} already exists`)
    } else {
      console.error('Error creating user:', error.message)
    }
    process.exit(1)
  }

  console.log('User created successfully!')
  console.log(`  ID: ${data.id}`)
  console.log(`  Email: ${data.email}`)
  console.log(`  Admin: ${data.is_admin}`)
}

main().catch(console.error)
