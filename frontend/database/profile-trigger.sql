-- Function to automatically create profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, xp, level, streak, last_active_date, created_at)
  VALUES (
    NEW.id,
    0,  -- Default XP
    1,  -- Default level
    0,  -- Default streak
    NOW(),  -- Current timestamp for last_active_date
    NOW()   -- Current timestamp for created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function when a new user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
