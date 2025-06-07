- [ ] Implement all features within PRD scope.

  A "User" is someone signed in. A "User" is at at least 1 of these:
    - General (not member, not leader, not exec)
    - Member (part of a band, but not leader)
    - Leader (as in band leader, assigned when General/Exec creates a band)
    - Exec (as in wxtj executive)

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
    - [ ] Event owner requests band (hey we are open if you wanna play, first come first serve)

  Admin related:
    ~~- [ ] Bc of scope, best i can think of is Only just have ban for now instead of delete, and just make it update status of anywhere the user that shows for other ppl that this person was banned, maybe like a badge or something.~~ For now, we will just implement dictionary covering most common explicit words, the rest (for now) since its not most ppl and due to limited time/scope of project, developers/maintainers can directly delete from DB if it gets that bad.


