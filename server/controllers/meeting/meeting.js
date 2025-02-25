const express = require('express');
const MeetingHistory = require('../../model/schema/meeting');
const mongoose = require('mongoose');

/**
 * Add a new meeting record
 * @route POST /api/meetings
 */
const add = async (req, res) => {
  try {
    const { 
      agenda, 
      attendes, 
      attendesLead, 
      location, 
      related, 
      dateTime, 
      notes, 
      createBy 
    } = req.body;

    if (!agenda || !createBy) {
      return res.status(400).json({ 
        success: false, 
        message: 'Required fields missing' 
      });
    }

    const newMeeting = new MeetingHistory({
      agenda,
      attendes: attendes || [],
      attendesLead: attendesLead || [],
      location,
      related,
      dateTime,
      notes,
      createBy
    });

    const savedMeeting = await newMeeting.save();
    
    return res.status(201).json({
      success: true,
      data: savedMeeting,
      message: 'Meeting created successfully'
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * List all meetings with optional filtering
 * @route GET /api/meetings
 */
const index = async (req, res) => {
    try {
      const { page = 1, limit = 10, createBy, startDate, endDate } = req.query;
  
      const filter = { deleted: false };
      
      if (createBy) {
        filter.createBy = mongoose.Types.ObjectId(createBy);
      }
      
      if (startDate && endDate) {
        filter.timestamp = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const meetings = await MeetingHistory.find(filter)
        .populate('attendes', 'name email phone')
        .populate('attendesLead', 'name email phone')
        .populate('createBy', 'firstName lastName')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(limit));
      
      const total = await MeetingHistory.countDocuments(filter);
      
      // Transform meetings to include creator name instead of full object
      const transformedMeetings = meetings.map(meeting => {
        const meetingObj = meeting.toObject();
        if (meetingObj.createBy && (meetingObj.createBy.firstName || meetingObj.createBy.lastName)) {
          // Create full name from firstName and lastName
          const creatorName = `${meetingObj.createBy.firstName || ''} ${meetingObj.createBy.lastName || ''}`.trim();
          meetingObj.createdByName = creatorName;
        }
        return meetingObj;
      });
      
      return res.status(200).json(transformedMeetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

/**
 * Get single meeting by ID
 * @route GET /api/meetings/:id
 */
const view = async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid meeting ID format'
        });
      }
      
      const meeting = await MeetingHistory.findOne({
        _id: id,
        deleted: false
      })
        .populate('attendes', 'name email phone')
        .populate('attendesLead', 'name email phone')
        .populate('createBy', 'firstName lastName');
      
      if (!meeting) {
        return res.status(404).json({
          success: false,
          message: 'Meeting not found'
        });
      }
      
      const response = meeting.toObject();
      if (response.createBy && response.createBy.firstName) {
        response.createdByName = `${response.createBy.firstName || ''} ${response.createBy.lastName || ''}`.trim();
      }
      
      return res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };

/**
 * Soft delete a meeting by ID
 * @route DELETE /api/meetings/:id
 */
const deleteData = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid meeting ID format'
      });
    }
    
    const result = await MeetingHistory.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Meeting not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Meeting deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Soft delete multiple meetings by IDs
 * @route POST /api/meetings
 */
const deleteMany = async (req, res) => {
  try {
    if (!req.body || !Array.isArray(req.body) || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or empty IDs array'
      });
    }
    
    const validIds = req.body.filter(id => mongoose.Types.ObjectId.isValid(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid meeting IDs provided'
      });
    }
    
    const result = await MeetingHistory.updateMany(
      { _id: { $in: validIds } },
      { deleted: true }
    );
    
    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} meetings deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting meetings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { add, index, view, deleteData, deleteMany };