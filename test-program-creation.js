// Test script to debug program creation
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testProgramCreation() {
  console.log('Testing program creation...')
  
  // Test 1: Check if we can connect to Supabase
  console.log('\n1. Testing Supabase connection...')
  try {
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    if (error) {
      console.error('Connection error:', error)
      return
    }
    console.log('✓ Connection successful')
  } catch (err) {
    console.error('Connection failed:', err)
    return
  }

  // Test 2: Check current programs table structure
  console.log('\n2. Checking programs table structure...')
  try {
    const { data, error } = await supabase.from('programs').select('*').limit(1)
    if (error) {
      console.error('Programs table error:', error)
    } else {
      console.log('✓ Programs table accessible')
    }
  } catch (err) {
    console.error('Programs table check failed:', err)
  }

  // Test 3: Try to create a simple program
  console.log('\n3. Testing program creation...')
  const testProgram = {
    title: 'Test Program Debug',
    description: 'This is a test program to debug creation issues',
    price: 999.99,
    duration_weeks: 4,
    session_count: 8,
    subjects: ['JavaScript'],
    level: 'beginner',
    is_active: true,
    created_by: 'admin'
    // Note: mentor_id is intentionally omitted (will be NULL)
  }

  try {
    const { data, error } = await supabase
      .from('programs')
      .insert(testProgram)
      .select()

    if (error) {
      console.error('Program creation error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
    } else {
      console.log('✓ Program created successfully:', data)
    }
  } catch (err) {
    console.error('Program creation failed:', err)
  }

  // Test 4: Clean up - delete the test program if it was created
  console.log('\n4. Cleaning up test data...')
  try {
    const { error } = await supabase
      .from('programs')
      .delete()
      .eq('title', 'Test Program Debug')
    
    if (error) {
      console.error('Cleanup error:', error)
    } else {
      console.log('✓ Test data cleaned up')
    }
  } catch (err) {
    console.error('Cleanup failed:', err)
  }
}

testProgramCreation().catch(console.error)