/**
 * Create Demo User Script
 *
 * Creates a demo user in Supabase Auth and links it to the User table.
 * Uses Supabase Admin SDK to bypass email confirmation.
 *
 * Usage: tsx scripts/create-demo-user.ts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL:', SUPABASE_URL ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? '✓' : '✗');
  process.exit(1);
}

// Create Supabase Admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEMO_EMAIL = 'demo@pharmanordic.com';
const DEMO_PASSWORD = 'PharmaNordic2026!';
const WORKSPACE_ID = 'demo-workspace';

async function createDemoUser() {
  console.log('🚀 Creating demo user...\n');

  try {
    // Step 1: Create user in Supabase Auth
    console.log('1️⃣  Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: 'Demo User',
        workspace: 'Pharma Nordic Demo',
      },
    });

    let userId: string;
    let userEmail: string;

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists in Auth, fetching existing user...');

        const { data, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = data.users.find((u: any) => u.email === DEMO_EMAIL);
        if (!existingUser) {
          throw new Error('User exists but could not be found');
        }

        console.log('✅ Found existing user:', existingUser.id);

        // Use existing user data
        userId = existingUser.id;
        userEmail = existingUser.email!;
      } else {
        throw authError;
      }
    } else {
      console.log('✅ User created in Auth:', authData.user!.id);
      userId = authData.user!.id;
      userEmail = authData.user!.email!;
    }

    // Step 2: Create user in public.User table
    console.log('\n2️⃣  Creating user in public.User table...');

    const { data: existingUser, error: checkError } = await supabase
      .from('User')
      .select('id')
      .eq('supabaseId', userId)
      .single();

    if (existingUser) {
      console.log('⚠️  User already exists in User table:', existingUser.id);
    } else {
      const { error: insertError } = await supabase
        .from('User')
        .insert({
          id: `user-${userId.substring(0, 8)}`,
          email: userEmail,
          supabaseId: userId,
          workspaceId: WORKSPACE_ID,
        });

      if (insertError) {
        throw insertError;
      }

      console.log('✅ User created in User table');
    }

    // Step 3: Verify user can sign in
    console.log('\n3️⃣  Verifying user can sign in...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    if (signInError) {
      throw signInError;
    }

    console.log('✅ Sign-in successful');
    console.log('   Access token:', signInData.session?.access_token.substring(0, 20) + '...');

    // Step 4: Summary
    console.log('\n' + '='.repeat(60));
    console.log('✅ Demo user created successfully!\n');
    console.log('📧 Email:    ', DEMO_EMAIL);
    console.log('🔑 Password: ', DEMO_PASSWORD);
    console.log('🆔 User ID:  ', userId);
    console.log('🏢 Workspace:', WORKSPACE_ID);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Error creating demo user:');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
createDemoUser();
