- [X] Implement all features within PRD scope.

  A "User" is someone signed in. A "User" is at at least 1 of these:
    - General (not member, not leader, not exec)
    - Member (part of a band, but not leader)
    - Leader (as in band leader, assigned when General/Exec creates a band)
    - Exec (as in WXTJ Executive)

  Band related:
    - [X] User creates band that is visible to others
    - [X] User requests to join band, owner of band sees request
    - [X] Leader accepting/rejecting memeber request
    - [X] Leader kicks memeber
    - [X] Leader promotes memeber and role switches
    - [X] Member gets promoted and role switches
    - [X] Leader leaves band (cant until they promote unless only 1 person left, also leave should show if multiple, if only 1, it should say leave and delete band)

  Events related:
    - [X] User creates events that is visible to others
    - [X] Events can't be at the same slot
    - [X] Users can't create event with same slot as other events
    - [X] Event owner requests band (hey we are open if you wanna play, first come first serve)

  Admin related:
    ~~- [ ] Bc of scope, best i can think of is Only just have ban for now instead of delete, and just make it update status of anywhere the user that shows for other ppl that this person was banned, maybe like a badge or something.~~ For now, we will just implement dictionary covering most common explicit words, the rest (for now) since its not most ppl and due to limited time/scope of project, developers/maintainers can directly delete from DB if it gets that bad.


