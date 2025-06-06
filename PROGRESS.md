- [ ] Implement all features within PRD scope.

  A "User" is someone signed in. A "User" is at at least 1 of these:
    - General (not member, not leader, not exec)
    - Member (part of a band, but not leader)
    - Leader (as in band leader, assigned when General/Exec creates a band)
    - Exec (as in WXTJ Executive)

  Rules for user roles:
    - For now, memeber can't be a leader, member can't be a leader, only memeber or leader if tied to a band in some way. (rule doesn't apply to Exec)
    - Exec can't be General role ever.
    - Only Exec can be memeber and leader of a band at the same time. This is to allow for the point right below.
    - Only Exec can create multiple bands, only Exec can be member of multiple bands.

  Notes:
    - Exec ability to be memebers of multiple bands and leaders of multiple bands means watch out for availability. Examples:
      - being part of a band (leader/memeber), that band accepting to play at event, means all other bands exec is part of must be accounted for. (could this be easily fixed with availability features? like something automatically updates if a user is playing at a event or not? maybe then for events showing for a band, for a band to approve, all other members must be available? there must be a check that no user is currently playing at a another event (this would be concern mostly for execs tho).

  Band related:
    - [ ] User creates band that is visible to others
    - [ ] User requests to join band, owner of band sees request
    - [ ] Leader accepting/rejecting memeber request
    - [ ] Leader kicks memeber
    - [ ] Leader promotes memeber and role switches
    - [ ] Member gets promoted and role switches
    - [ ] Leader leaves band (cant until they promote unless only 1 person left, also leave should show if multiple, if only 1, it should say leave and delete band)

  Events related:
    - [ ] User creates events that is visible to others
    - [ ] Events can't be at the same slot
    - [ ] Users can't create event with same slot as other events
    - [NOT HOW IT WORKS RN, FIX] Event owner requests band (hey we are open if you wanna play, first come first serve)
    - []

  Admin related:
    - [ ] View all users, for scope, only have ability to delete any user not an exec (account for like if theyre in a band, it randomly promotes someone else if theres other members, if not then it deletes the band, if band had accepted to play and other memebers and someone else got promoted it should just update the state like the new memeber. but then wouldnt the band be missing ppl? should it automatically post a fill in only under condition that band was already playing at event, someone got deleted by admin? think this stuff later, i feel like there are a lot of edge cases so we have to scope it down)
    - [ ] Bc of scope, best i can think of is Only just have ban, and just make it update status of anywhere the user that shows for other ppl that this person was banned, maybe like a badge or something.

