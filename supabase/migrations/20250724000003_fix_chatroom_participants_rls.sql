-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Hosts can add participants" ON chatroom_participants;

-- Create a simple policy that allows any authenticated user to join any chatroom
CREATE POLICY "Users can join chatrooms" ON chatroom_participants
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own participant records" ON chatroom_participants
    FOR UPDATE USING (
        user_id = auth.uid()
    ); 