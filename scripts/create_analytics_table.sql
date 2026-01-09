-- Create analytics table for tracking visitors
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  visitors INTEGER DEFAULT 0,
  page_views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics(date);

-- Enable Row Level Security
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anon key to insert/update (for public API routes)
-- This allows the visitor tracking API to work
CREATE POLICY "Allow anon insert and update" ON analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow anon update" ON analytics
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create policy to allow service role full access (for admin routes)
-- Service role key bypasses RLS, but this is here for completeness
CREATE POLICY "Allow service role full access" ON analytics
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_analytics_updated_at BEFORE UPDATE ON analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

