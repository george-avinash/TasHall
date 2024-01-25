// require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const uniqid = require("uniqid");

const app = express();

app.use(cors());
app.use(bodyParser.json());
const port =3000;

app.listen(port, () => console.log(`Your app is running with ${port}`));

let rooms = [];
let roomNo = 100;
let bookings = [];
let date_regex = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
let time_regex = /^(0[0-9]|1\d|2[0-3])\:(00)/;

app.get("/", function (req, res) {
  res.json({
    output: "HomePage",
  });
});

app.get("/getAllRooms", function (req, res) {
  res.json({
    output: rooms,
  });
});

app.get("/getAllBookings", function (req, res) {
  res.json({
    output: bookings,
  });
});

app.post("/createRoom", function (req, res) {
  let room = {};
  room.id = uniqid();
  room.roomNo = roomNo;
  room.bookings = [];
  if (req.body.noSeats) {
    room.noSeats = req.body.noSeats;
  } else {
    res.status(400).json({ output: "Please specify No of seats for Room" });
  }
  if (req.body.amenities) {
    room.amenities = req.body.amenities;
  } else {
    res.status(400).json({
      output: "Please specify all Amenities for Room in Array format",
    });
  }
  if (req.body.price) {
    room.price = req.body.price;
  } else {
    res.status(400).json({ output: "Please specify price per hour for Room" });
  }
  rooms.push(room);
  roomNo++;
  res.status(200).status({ output: "Room Created Successfully" });
});

app.post("/createBooking", function (req, res) {
    let booking = {}; // Initialize booking object
    booking.id = uniqid();
    if (req.body.custName) {
      booking.custName = req.body.custName;
    } else {
      return res
        .status(400)
        .json({ output: "Please specify customer Name for booking" });
    }
    if (req.body.date) {
      if (date_regex.test(req.body.date)) {
        booking.date = new Date(req.body.date);
      } else {
        return res.status(400).json({ output: "Please Specify date in MM/DD/YYYY" });
      }
    } else {
      return res.status(400).json({ output: "Please specify date for booking" });
    }
  
    if (req.body.startTime) {
      if (time_regex.test(req.body.startTime)) {
        booking.startTime = req.body.startTime;
      } else {
        return res.status(400).json({
          output:
            "Please specify time in hh:min(24-hr format) where minutes should be 00 only",
        });
      }
    } else {
      return res
        .status(400)
        .json({ output: "Please specify starting time for booking" });
    }
    if (req.body.endTime) {
      if (time_regex.test(req.body.endTime)) {
        booking.endTime = req.body.endTime;
      } else {
        return res.status(400).json({
          output:
            "Please specify time in hh:min(24-hr format) where minutes should be 00 only",
        });
      }
    } else {
      return res
        .status(400)
        .json({ output: "Please specify Ending time for booking." });
    }
  
    const availableRooms = rooms.filter((room) => {
      if (room.bookings.length == 0) {
        return true;
      } else {
        room.bookings.filter((book) => {
          if (book.date == req.body.date) {
            if (
              parseInt(book.startTime.substring(0, 2)) <
                parseInt(req.body.startTime.substring(0, 2)) &&
              parseInt(book.endTime.substring(0, 2)) >
                parseInt(req.body.endTime.substring(0, 2))
            ) {
              return true;
            }
          } else {
            return true;
          }
        });
      }
    });
    if (availableRooms.length == 0) {
      return res
        .status(400)
        .json({ output: "No Available Rooms on Selected Date and Time" });
    } else {
      const roomRec = availableRooms[0];
      rooms.forEach((element) => {
        if (element.roomNo == roomRec.roomNo) {
          rooms[rooms.indexOf(element)].bookings.push({
            custName: req.body.custName,
            startTime: req.body.startTime,
            endTime: req.body.endTime,
            date: req.body.date,
          });
        }
      });
      const bookingRec = {
        id: booking.id, // Add booking id to the response
        custName: req.body.custName,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        date: req.body.date,
        roomNo: roomRec.roomNo,
        cost:
          parseInt(roomRec.price) *
          (parseInt(req.body.endTime.substring(0, 2)) -
            parseInt(req.body.startTime.substring(0, 2))),
      };
  
      bookings.push(bookingRec);
      res.status(200).json({ output: "Room Booking Successfully" });
    }
  });
  
