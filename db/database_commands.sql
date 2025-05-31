-- We can all contribute/store the database commands here, along with comments as needed.
-- DUE 5/31 AKA TONIGHT
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
    -- user
    -- roles
    -- user_roles
    -- band_leader
    -- band_member
    -- general_user
    -- wxtj_exec
    -- band
    -- event
    -- membership_request
    -- event_request
    -- fill_in_request
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
    -- roles
    -- user_roles
    -- band_leader
    -- band_member
    -- general_user
    -- wxtj_exec
    -- band
    -- event
    -- membership_request
    -- event_request
    -- fill_in_request
-- SQL select statements that summarize data.
    -- user
    -- roles
    -- user_roles
    -- band_leader
    -- band_member
    -- general_user
    -- wxtj_exec
    -- band
    -- event
    -- membership_request
    -- event_request
    -- fill_in_request