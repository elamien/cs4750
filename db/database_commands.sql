-- An SQL script that creates all your tables.  Primary key and foreign key constraints must be included.  Check constraints must be included as well, where applicable.
    -- user
    CREATE TABLE User (
        UserID INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
        FirstName VARCHAR(30) NOT NULL,
        LastName VARCHAR(30) NOT NULL,
        Bio TINYTEXT, --limits to 255 characters to keep bios short
        Email VARCHAR(50) NOT NULL,
        PhoneNumber INTEGER(10),
        Genre VARCHAR(11) NOT NULL,
        Instrument TINYTEXT NOT NULL,
        CONSTRAINT Check_Genre CHECK IN ('Classic Rock', 'Country', 'Pop', 'RnB', 'Metal', 'Classical', 'Folk', 'Hip Hop', 'Electronic', 'Jazz', 'Indie', 'Alternative')
    );
    -- roles
    CREATE TABLE Roles (
        RoleID INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
        RoleName VARCHAR(12) NOT NULL
    );
    -- user_roles
    CREATE TABLE UserRoles (
        UserRoleID INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
        UserID INT NOT NULL,
        RoleID INT NOT NULL,
        FOREIGN KEY (UserID) REFERENCES User(UserID),
        FOREIGN KEY (RoleID) REFERENCES Roles(RoleID)
    );
    -- band_leader
    CREATE TABLE BandLeader (
        UserRoleID INT NOT NULL,
        BandID INT NOT NULL,
        FOREIGN KEY (UserRoleID) REFERENCES UserRoles(UserRoleID),
        FOREIGN KEY (BandID) REFERENCES Band(BandID)
    );
    -- band_member
    CREATE TABLE BandMember (
        UserRoleID INT NOT NULL,
        BandID INT NOT NULL,
        FOREIGN KEY (UserRoleID) REFERENCES UserRoles(UserRoleID),
        FOREIGN KEY (BandID) REFERENCES Band(BandID)
    );
    -- general_user
    CREATE TABLE GeneralUser (
        UserRoleID INT NOT NULL,
        LookingForABand BOOLEAN DEFAULT False,
        FOREIGN KEY (UserRoleID) REFERENCES UserRoles(UserRoleID)
    );
    -- wxtj_exec
    CREATE TABLE WXTJExec (
        UserRoleID INT NOT NULL,
        ExecTitle VARCHAR(30), -- no check constraint bc new roles may be added/removed based on club needs
        FOREIGN KEY (UserRoleID) REFERENCES UserRoles(UserRoleID)
    );
    -- band
    CREATE TABLE Band (
        BandID INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
        Name TINYTEXT NOT NULL,
        Email VARCHAR(50) NOT NULL,
        PhoneNumber INTEGER(10),
        Genre VARCHAR(11) NOT NULL,
        TotalEventsPlayed INT DEFAULT 0,
        EventsPlayedYTD INT DEFAULT 0,
        Description TINYTEXT,
        CONSTRAINT Check_Genre CHECK IN ('Classic Rock', 'Country', 'Pop', 'RnB', 'Metal', 'Classical', 'Folk', 'Hip Hop', 'Electronic', 'Jazz', 'Indie', 'Alternative')
    );
    -- event
    CREATE TABLE Event (
        EventID INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
        UserID INT NOT NULL,
        EventTitle TINYTEXT,
        DateTime DATETIME,
        Location TINYTEXT,
        Genre VARCHAR(11) NOT NULL,
        Description TINYTEXT,
        SlotOne INT,
        SlotTwo INT,
        SlotThree INT,
        SlotFour INT,
        CONSTRAINT Check_Genre CHECK IN ('Classic Rock', 'Country', 'Pop', 'RnB', 'Metal', 'Classical', 'Folk', 'Hip Hop', 'Electronic', 'Jazz', 'Indie', 'Alternative')
        FOREIGN KEY (UserID) REFERENCES User(UserID),
        FOREIGN KEY (SlotOne) REFERENCES Band(BandID),
        FOREIGN KEY (SlotTwo) REFERENCES Band(BandID),
        FOREIGN KEY (SlotThree) REFERENCES Band(BandID),
        FOREIGN KEY (SlotFour) REFERENCES Band(BandID)
    );
    -- membership_request
    CREATE TABLE MembershipRequest (
        MembershipRequestID INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
        UserID INT NOT NULL,
        BandID INT NOT NULL,
        Status BOOLEAN DEFAULT False,
        TimeCreated DATETIME,
        Message TINYTEXT,
        FOREIGN KEY (UserID) REFERENCES User(UserID),
        FOREIGN KEY (BandID) REFERENCES Band(BandID)
    );
    -- event_request
    CREATE TABLE EventRequest (
        EventRequestID INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
        BandID INT NOT NULL,
        EventID INT NOT NULL,
        Status BOOLEAN DEFAULT False,
        TimeCreated DATETIME,
        Message TINYTEXT,
        FOREIGN KEY (BandID) REFERENCES Band(BandID),
        FOREIGN KEY (EventID) REFERENCES Event(EventID)
    );
    -- fill_in_request
    CREATE TABLE FillInRequest (
        FillInRequestID INT UNIQUE NOT NULL AUTO_INCREMENT PRIMARY KEY,
        BandID INT NOT NULL,
        EventID INT NOT NULL,
        Description TINYTEXT,
        FillInMemberID INT,
        FOREIGN KEY (BandID) REFERENCES Band(BandID),
        FOREIGN KEY (EventID) REFERENCES Event(EventID),
        FOREIGN KEY (FillInMemberID) REFERENCES User(UserID)
    );
-- SQL insert statements to fill your tables with initial data.  Include enough data to show proper testing of your SQL select statements below.
    -- roles
INSERT INTO Roles (RoleID, RoleName) VALUES
(1, “General”);   
    -- user
INSERT INTO User (UserID, FirstName, LastName, Bio, Email, PhoneNumber, Genre, Instrument) VALUES
(1, ‘John’, ‘Smith’, ‘Music dude looking to play some stuff’, ‘jsmith@email.com’, 123456789, ‘Folk’, ‘Guitar’);
    -- user_roles
INSERT INTO UserRoles (UserRoleID, UserID, RoleID) VALUES
(1, 1, 1);
    -- band_leader
INSERT INTO BandLeader (UserRoleID, BandID) VALUES
(1, 1);
    -- band_member
INSERT INTO BandMember (UserRoleID, BandID) VALUES
(1, 1);
    -- general_user
INSERT INTO GeneralUser (UserRoleID, LookingForABand) VALUES
(1, TRUE);
    -- wxtj_exec
INSERT INTO WXTJExec (UserRoleID, ExecTitle) VALUES
(1, 'President');
    -- band
INSERT INTO Band (BandID, Name, Email, PhoneNumber, Genre, TotalEventsPlayed, EventsPlayedYTD, Description) VALUES
(1, 'Electric Dreams', 'electricdreams@band.com', 1112223333, 'Alternative', 15, 5, 'Alternative rock band with electronic influences');
    -- event
INSERT INTO Event (EventID, UserID, EventTitle, datetime, location, genre, status, description, slot_one, slot_two, slot_three, slot_four) VALUES
(1, 1, 'Summer Music Festival', '2025-07-15 18:00:00', 'The Pavilion', 'Alternative', 'open', 'Annual summer music showcase', 1, NULL, NULL, NULL);
    -- membership_request
INSERT INTO membership_request (membership_request_id, user_id, band_id, status, time_created, message) VALUES
(1, 1, 1, 'pending', '2025-05-20 10:00:00', 'I would love to join as a rhythm guitarist');
    -- event_request
INSERT INTO event_request (event_request_id, band_id, event_id, status, time_created, message) VALUES
(1, 1, 1, 'pending', '2025-05-25 11:00:00', 'Electric Dreams would love to compete!');
    -- fill_in_request
INSERT INTO fill_in_request (fill_in_request_id, band_id, event_id, Fill_In_Description, Fill_InMemberID) VALUES
(1, 1, 1, 'Need drummer for Summer Festival - Lisa is unavailable', NULL);
-- An SQL select statement for each table that shows all rows.
    -- user
    SELECT * FROM User;
    -- roles
    SELECT * FROM Roles;
    -- user_roles
    SELECT * FROM UserRoles;
    -- band_leader
    SELECT * FROM BandLeader;
    -- band_member
    SELECT * FROM BandMember;
    -- general_user
    SELECT * FROM GeneralUser;
    -- wxtj_exec
    SELECT * FROM WXTJExec;
    -- band
    SELECT * FROM Band;
    -- event
    SELECT * FROM Event;
    -- membership_request
    SELECT * FROM MembershipRequest;
    -- event_request
    SELECT * FROM EventRequest;
    -- fill_in_request
    SELECT * FROM FillInRequest;
-- SQL select statements that use criteria to select some rows.
    -- user
SELECT * FROM User 
WHERE Instrument LIKE '%Guitar%';
    -- roles
SELECT * FROM Roles 
WHERE RoleName = 'Band Member';
    -- user_roles
SELECT ur.* FROM UserRoles ur
WHERE ur.RoleID = 2;
    -- band_leader
SELECT bl.* FROM BandLeader bl
WHERE bl.UserRoleID = 4;
    -- band_member
SELECT bm.* FROM BandMember bm
WHERE bm.BandID = 1;
    -- general_user
SELECT gu.* FROM GeneralUser gu
WHERE gu.LookingForABand = TRUE;
    -- wxtj_exec
SELECT we.* FROM WXTJExec we
WHERE we.ExecTitle = 'Event Coordinator'
    -- band
SELECT * FROM Band 
WHERE Genre = 'Jazz' AND TotalEventsPlayed > 10;
    -- event
SELECT * FROM Event 
WHERE Genre = 'Alternative' 
AND status = 'open' 
AND datetime > NOW();
    -- membership_request
SELECT mr.* FROM membership_request mr
WHERE mr.band_id = 1 
AND mr.status = 'pending';
    -- event_request
​​SELECT er.* FROM event_request er
WHERE er.event_id = 1 
AND er.status = 'accepted';
    -- fill_in_request
SELECT fir.* FROM fill_in_request fir
JOIN Event e ON fir.event_id = e.EventID
WHERE fir.Fill_InMemberID IS NULL 
AND e.datetime > NOW();
-- SQL select statements that summarize data.
    -- user
    SELECT Genre, COUNT(*) AS UserCount
    FROM User
    GROUP BY Genre;
    -- roles
    SELECT r.RoleName, COUNT(ur.UserID) AS UsersPerRole
    FROM Roles r
    JOIN UserRoles ur ON r.RoleID = ur.RoleID
    GROUP BY r.RoleName;
    -- user_roles
    SELECT UserID, COUNT(DISTINCT RoleID) AS RoleCount
    FROM UserRoles
    GROUP BY UserID;    
    -- band_leader
    SELECT UserRoleID, COUNT(BandID) AS BandsLed
    FROM BandLeader
    GROUP BY UserRoleID;
    -- band_member
    SELECT UserRoleID, COUNT(BandID) AS BandsJoined
    FROM BandMember
    GROUP BY UserRoleID;
    -- general_user
    SELECT LookingForABand, COUNT(*) AS UserCount
    FROM GeneralUser
    GROUP BY LookingForABand;
    -- wxtj_exec
    SELECT ExecTitle, COUNT(*) AS ExecCount
    FROM WXTJExec
    GROUP BY ExecTitle;
    -- band
    SELECT Genre, AVG(TotalEventsPlayed) AS AvgTotalEvents, COUNT(*) AS BandCount
    FROM Band
    GROUP BY Genre;
    -- event
    SELECT Genre, COUNT(*) AS UpcomingEventCount
    FROM Event
    WHERE DateTime > NOW()
    GROUP BY Genre;
    -- membership_request
    SELECT Status, COUNT(*) AS RequestCount
    FROM MembershipRequest
    GROUP BY Status;
    -- event_request
    SELECT Status, COUNT(*) AS RequestCount
    FROM EventRequest
    GROUP BY Status;
    -- fill_in_request
    SELECT COUNT(*) AS PendingFillInRequests
    FROM FillInRequest
    WHERE FillInMemberID IS NULL;
   
