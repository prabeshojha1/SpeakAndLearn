# Supabase Setup Guide for SpeakAndLearn

This guide will help you set up Supabase for your SpeakAndLearn application.

## Prerequisites

- A Supabase account (sign up at [supabase.com](https://supabase.com))
- Node.js and npm installed
- Your SpeakAndLearn project ready

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `speakandlearn` (or your preferred name)
   - **Database Password**: Create a strong password
   - **Region**: Choose the closest region to your users
5. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon/Public Key** (starts with `eyJ`)

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in your project root:
   ```bash
   touch .env.local
   ```

2. Add your Supabase credentials to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. Replace `your_project_url_here` and `your_anon_key_here` with your actual values from Step 2.

## Step 4: Set Up the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/schema.sql`
3. Paste it into the SQL Editor and click "Run"
4. This will create all the necessary tables, policies, and functions

## Step 5: Configure Authentication

1. In your Supabase dashboard, go to **Authentication** → **Settings**
2. Configure your site URL:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add `http://localhost:3000/auth/callback`
3. Save the changes

## Step 6: Set Up Storage (Optional)

If you plan to store images or audio files:

1. Go to **Storage** in your Supabase dashboard
2. Create a new bucket called `quiz-assets`
3. Set the bucket to public or configure appropriate policies

## Step 7: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Open your browser to `http://localhost:3000`
3. Check the browser console for any Supabase connection errors

## Step 8: Create Sample Data and Admin User (Optional)

You can create some sample quizzes and questions to test your setup:

```sql
-- First, create an admin user (replace with your actual user ID)
-- You can get your user ID from the auth.users table or from your app after signing up
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';

-- Insert a sample quiz (only works if you're an admin)
INSERT INTO public.quizzes (title, description, language, difficulty, category, created_by)
VALUES (
  'Basic Spanish Greetings',
  'Learn common Spanish greetings and introductions',
  'Spanish',
  'beginner',
  'Greetings',
  (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
);

-- Insert sample questions (only works if you're an admin)
INSERT INTO public.questions (quiz_id, question_text, question_type, correct_answer, options)
VALUES 
  (
    (SELECT id FROM public.quizzes WHERE title = 'Basic Spanish Greetings' LIMIT 1),
    'How do you say "Hello" in Spanish?',
    'multiple_choice',
    'Hola',
    '["Hola", "Adiós", "Gracias", "Por favor"]'
  ),
  (
    (SELECT id FROM public.quizzes WHERE title = 'Basic Spanish Greetings' LIMIT 1),
    'What does "Buenos días" mean?',
    'multiple_choice',
    'Good morning',
    '["Good morning", "Good afternoon", "Good evening", "Goodbye"]'
  );
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key (for server-side operations) | No |

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables" error**
   - Make sure your `.env.local` file exists and has the correct values
   - Restart your development server after adding environment variables

2. **Authentication not working**
   - Check that your site URL and redirect URLs are correctly configured in Supabase
   - Ensure your environment variables are correct

3. **Database connection errors**
   - Verify your Supabase project is active
   - Check that the schema has been applied correctly

### Getting Help

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js Documentation](https://nextjs.org/docs)

## Next Steps

After setting up Supabase, you can:

1. **Set up your first admin user**:
   - Sign up with your email
   - Run the SQL command to make yourself an admin: `UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';`

2. **Create quizzes as an admin**:
   - Use the admin panel to create and manage quizzes
   - Only admins can create, edit, or delete quizzes

3. **Test the user experience**:
   - Players can only view and play quizzes
   - They cannot create or modify quizzes

4. **Implement additional features**:
   - Add progress tracking for users
   - Implement real-time features using Supabase's real-time subscriptions
   - Add analytics and reporting

## Security Notes

- Never commit your `.env.local` file to version control
- Use Row Level Security (RLS) policies to protect your data
- Regularly rotate your API keys
- Monitor your Supabase usage in the dashboard 