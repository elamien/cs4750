# Test Data Summary

## Overview
The HooJams database has been populated with comprehensive test data to make the application feel alive and realistic. This document outlines what data has been added.

## Users (8 Total)

### Musicians with Full Profiles:
1. **John Bonham** (jbonham@led.com) - Band Leader
   - Instrument: Drums
   - Bio: Experienced drummer with 15+ years in rock and blues bands
   - Genre: Rock

2. **Charles Mingus** (cmingus@jazz.com) - Band Member
   - Instrument: Bass
   - Bio: Jazz bassist and composer, specializes in improvisation
   - Genre: Jazz

3. **David Gilmour** (dgilmour@floyd.com) - Band Leader
   - Instrument: Guitar
   - Bio: Guitarist and producer known for atmospheric soundscapes
   - Genre: Progressive Rock

4. **Diana Krall** (dkrall@jazz.com) - Band Member
   - Instrument: Piano
   - Bio: Piano virtuoso with classical training and jazz expertise
   - Genre: Jazz

### Test Users:
5. **Sarah Leader** (bandleader@test.com) - Band Leader
   - Instrument: Guitar

6. **Mike Member** (bandmember@test.com) - Band Member
   - Instrument: Piano

7. **Gary General** (general@test.com) - General User
   - Instrument: Vocals

8. **Wesley Executive** (wxtj.exec@virginia.edu) - WXTJ Executive
   - Instrument: Production

## Bands (3 Total)

### 1. The Local Beats
- **Leader**: Sarah Leader
- **Members**: Mike Member
- **Genre**: Rock
- **Description**: Charlottesville's premier rock cover band
- **Contact**: beats@local.com, 434-555-1001

### 2. Jazz Collective
- **Leader**: John Bonham
- **Members**: Diana Krall
- **Genre**: Jazz
- **Description**: UVA Jazz ensemble
- **Contact**: collective@jazz.com, 434-555-1002

### 3. Prog Rock Project
- **Leader**: David Gilmour
- **Members**: Charles Mingus
- **Genre**: Progressive Rock
- **Description**: Experimental rock fusion
- **Contact**: prog@rock.com, 434-555-1003

## Events (6 Total)

### Existing Events:
1. **Event 1-3**: Basic events from initial setup

### New Events:
4. **Summer Jazz Festival**
   - Date: July 15, 2024, 7:00 PM
   - Location: Downtown Pavilion
   - Genre: Jazz
   - Description: Annual summer jazz festival featuring local bands
   - Slots: Piano, Saxophone

5. **Rock Night at The Corner**
   - Date: June 20, 2024, 9:00 PM
   - Location: The Corner Bar
   - Genre: Rock
   - Description: Weekly rock music night
   - Slots: Guitar, Drums

6. **Wedding Reception**
   - Date: August 10, 2024, 6:00 PM
   - Location: Boars Head Resort
   - Genre: Various
   - Description: Wedding reception music - mix of genres
   - Slots: Vocals, Piano

## Fill-In Requests (3 Active)

1. **The Local Beats** needs drummer for Summer Jazz Festival
   - Status: Pending
   - Description: "Need a drummer for jazz festival - our regular drummer is unavailable"

2. **Jazz Collective** needs guitarist for Rock Night
   - Status: Pending
   - Description: "Looking for backup guitarist for rock night"

3. **Prog Rock Project** needs pianist for Wedding Reception
   - Status: Pending
   - Description: "Need piano player for wedding reception"

## User Favorites

### Favorite Bands:
- David Gilmour ❤️ Jazz Collective
- Sarah Leader ❤️ The Local Beats
- Gary General ❤️ Prog Rock Project

### Favorite Events:
- John Bonham ❤️ Summer Jazz Festival
- Charles Mingus ❤️ Rock Night at The Corner
- Diana Krall ❤️ Wedding Reception

## Role Assignments

- **4 Band Leaders**: John, David, Sarah (plus one extra role)
- **4 Band Members**: Charles, Diana, Mike (plus one extra role)
- **1 General User**: Gary
- **1 WXTJ Executive**: Wesley

## Database State Summary

✅ **Users**: 8 with diverse instruments and detailed bios
✅ **Bands**: 3 bands with proper leader/member relationships
✅ **Events**: 6 events across different genres and dates
✅ **Fill-In Requests**: 3 pending requests for realistic workflow
✅ **Favorites**: Users have saved favorite bands and events
✅ **Roles**: Complex role-based permissions properly assigned

## ⚠️ Important Note

**The backend API currently does NOT work with this schema structure.** The database uses a complex role-based system while the API expects simplified direct relationships. See `SETUP_NOTES.md` for details on this critical issue.

Despite this, the database is now fully populated with realistic test data that makes the application feel alive once the API mismatch is resolved. 