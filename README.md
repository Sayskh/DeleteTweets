# Disclaimer

It should work just fine, I regularly use the script myself, but if anything wrong happens I am not taking any responsibility. Do not use this script if the 0.1% possible failure scares you.

This script is a fork and modification of Lyfhael's Original "DeleteTweets" (Found at https://github.com/Lyfhael/DeleteTweets). It has been updated to work with current X.com API changes. 

This entire code is provided "AS IS" and I take absolutely no responsibility and no warranty is given. The code is based on the original work by Lyfhael and community contributions.

# Prerequisites

This will ONLY work in Google Chrome at a Desktop Computer (Tested on Windows and Linux)
The script WON'T work in any kind of Firefox-Browser!!!

# Tutorial

(if you can't find the transaction id, put any value it'll work)

##  Video Tutorial
https://github.com/teisseire117/DeleteTweets/assets/43145883/249584c3-ce01-424b-8ce5-751e976c8df0

## Text Tutorial

**FIRST** You should copy the entire raw content of the main.js into a text editor of your choice. Don't directly paste it into the console as it will be hard to edit the Options correctly!

- Go to https://x.com/
- Open the DevTools by pressing CTRL + SHIFT + I or F12
- Click on Network tab in the DevTools console
  - If requests are not being recorded, press CTRL + E and wait 5 seconds
- You should now have something like this : ![ULXBFrT](https://github.com/teisseire117/DeleteTweets/assets/43145883/f784c575-efbb-42a2-a217-4700ba715b7e)
- Click on Fetch/XHR : ![KtZYL0L](https://github.com/teisseire117/DeleteTweets/assets/43145883/f0cdb3e8-f9ee-4ce3-ac39-c0a463c00bf6)
- **Now go to your X Profile and click on your "Replies" tab**
- Now click on the request which name starts with `UserTweetsAndReplies`, and look for the **authorization** and **X-Client-Transaction-Id** values
- **Important**: You also need to get your X.com username (without the @ symbol)
- Now replace the values in the .js file:
  - Replace `***` in `authorization` with your Bearer token (usually starts with many A's)
  - Replace `***` in `client_tid` with your X-Client-Transaction-Id value
  - Replace `***` in `username` with your X.com username (WITHOUT the @ symbol!)
- **(Ignore the X-Client-UUID Values in any screenshots you see in this tutorial, this value has been removed! Don't add it!)**
- Here is an example of how it should look: ![E0M6Bf9](https://github.com/teisseire117/DeleteTweets/assets/43145883/bac5806b-9c76-4018-b2c0-55fb9080e715)

## If you encounter 403/404 errors
Before opening an Issue, try to change the "random_resource" variable in the script.

When you look into the "UserTweetsAndReplies" request, you should see that massive request URL right at the top:
<img width="821" height="63" alt="image" src="https://github.com/user-attachments/assets/b25a10fc-2c51-4d99-89c9-8e3c90eeb154" />

In this Request URL there is that part after "graphql" between two Slashes. Copy only the Part between the Slashes (As highlighted in the image, in this Example it would be WJdO9AzTVxm7lmjLgreeEA) and set it into the "random_resource" variable in your script.
<img width="375" height="50" alt="image" src="https://github.com/user-attachments/assets/9c4b6d5f-47a3-4870-87cd-82f17dbe7d0a" />

Now it should work!

**Note**: With the new Rate Limits and X's handling of these, it is normal to encounter multiple 404 errors during deletion. That's completely normal. You only need to open an Issue or change the "random_resource" variable when it doesn't even start, even after a minute of trying!

## Filtering / Options

You can customize which tweets to delete by editing the `delete_options` variable:

### Date Range Filtering
- You can delete only tweets within a specific date range using `after_date` and `before_date`:
```javascript
"after_date": new Date('1900-01-01'), // year-month-day
"before_date": new Date('2100-01-01') // year-month-day
```

Example - to delete tweets from July 3rd, 2023:
```javascript
"after_date": new Date('2023-07-02'), // year-month-day
"before_date": new Date('2023-07-04') // year-month-day
```
**Note**: The script will go through ALL tweets but only delete those within your date range.

### Keyword Filtering
- Delete tweets containing specific keywords:
```javascript
"match_any_keywords": ["Hi", "Hello"] // Case sensitive
```

### Other Options
- `"unretweet": true` - Set to `true` to unretweet all your retweets, `false` to keep them
- `"delete_message_with_url_only": false` - Set to `true` to only delete tweets containing links
- `"do_not_remove_pinned_tweet": true` - Protects your pinned tweet from deletion
- `"tweets_to_ignore": [""]` - Add tweet IDs here to protect specific tweets from deletion
- `"delete_specific_ids_only": [""]` - Overrides default tweet search and only deletes tweets with specific IDs listed here (example: `["1111111111","22222222222","3333333333"]`). If empty (default), this option is ignored. If there's even a single ID here, all other options are ignored!
- `"from_archive": false` - Import tweets from X Archive for WAY faster deletion with no rate-limit (UNTESTED! Might not work!)
- `"old_tweets": false` - For older tweets that might not delete on first run (Probably doesn't work as of May 2025, bug reports appreciated!)

### Usage Instructions
1. Copy the entire script content to a text editor first
2. Edit the configuration options as needed
3. Copy/paste the modified script into the browser console
4. Press Enter and wait for deletion to complete
5. The script will show "✅ DELETE COMPLETE!" when finished
6. **Run the script a second time** - there are sometimes leftovers (should only take seconds the second time)

# FAQ

## Do I need to include the Bearer part of the authorization key?
Yes, but it's prefilled for you. Just replace the *** with your actual token.

## I can't find X-Client-Transaction-Id/authorization or get Error 400/403
In the request list, make sure you select a Request that starts with `UserTweetsAndReplies?v`...
You get such a request only when you are on your own profile and select the "Replies" Tab.

## What if I can't find my username?
Your username is what appears after x.com/ in your profile URL (without the @ symbol).

## The script says "Failed to fetch data"
This usually means:
- Your authorization token expired - get a new one
- X.com changed their API - try updating the "random_resource" variable
- You're being rate-limited - wait and try again

## Uncaught TypeError: entries is not iterable
If you have this error, please open an Issue so the script can be updated with new Query Endpoints.

## Script encounters multiple 404 errors during deletion
This is normal with X's current rate limiting. The script will continue working. Only worry if it doesn't start at all after a minute of trying.

## Script seems stuck or running slowly
This is normal - the script processes tweets in batches and includes delays to avoid rate limiting. Be patient and let it complete.

## Some tweets weren't deleted
1. Run the script a second time - there are often leftovers
2. Check if those tweets match your filtering criteria
3. Some very old tweets might require the `"old_tweets": true` option

# Credits

Original Repository: https://github.com/Lyfhael/DeleteTweets
Additional improvements inspired by: https://github.com/NietzscheKadse/XeetEntfernierer

# Other

Donation link for the original creator:
https://ko-fi.com/lolarchiver#
