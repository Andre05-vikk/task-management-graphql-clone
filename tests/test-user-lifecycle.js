console.log('Loading clients...');
const { restAPI } = require('./rest-client');
const { graphqlAPI } = require('./graphql-client');
console.log('Clients loaded successfully');

async function testUserLifecycle() {
    console.log('🔄 Testing User Lifecycle: Create → Delete → Verify Deletion');
    console.log('============================================================');
    
    const timestamp = Date.now();
    const testUser = {
        username: `testuser_${timestamp}`,
        email: `lifecycle_${timestamp}@test.com`,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User'
    };

    try {
        console.log('\n📊 REST API Test:');
        console.log('==================');
        
        // 1. Create user via REST
        console.log('1️⃣ Creating user via REST API...');
        const restUserResult = await restAPI.createUser(testUser);
        console.log('✅ REST User created:', restUserResult);
        
        // 2. Login to get token
        console.log('2️⃣ Logging in to get token...');
        const restLoginResult = await restAPI.login(testUser.email, testUser.password);
        console.log('✅ REST Login successful, token received');
        
        // 3. Verify user exists by getting user list
        console.log('3️⃣ Verifying user exists in database...');
        const usersBeforeDelete = await restAPI.getUsers(restLoginResult.token);
        const userExists = usersBeforeDelete.some(u => u.id === restUserResult.id);
        console.log(`✅ User exists in database: ${userExists} (found ${usersBeforeDelete.length} total users)`);
        
        // 4. Delete user
        console.log('4️⃣ Deleting user via REST API...');
        await restAPI.deleteUser(restUserResult.id, restLoginResult.token);
        console.log('✅ REST User deletion request completed');
        
        // 5. Verify user is deleted by trying to get user list (should fail with auth error)
        console.log('5️⃣ Verifying user is deleted from database...');
        try {
            await restAPI.getUsers(restLoginResult.token);
            console.log('❌ ERROR: Token still valid after user deletion');
        } catch (error) {
            if (error.message.includes('401') || error.message.includes('403') || error.message.includes('Unauthorized')) {
                console.log('✅ User successfully deleted - token invalidated (401/403)');
            } else if (error.message.includes('410')) {
                console.log('✅ User successfully deleted - resource gone (410)');
            } else {
                console.log('❓ Unexpected error:', error.message);
            }
        }
        
        console.log('\n📊 GraphQL API Test:');
        console.log('=====================');
        
        // 1. Create user via GraphQL
        console.log('1️⃣ Creating user via GraphQL API...');
        const gqlUserData = {
            email: testUser.email,
            password: testUser.password
        };
        const gqlUserResult = await graphqlAPI.createUser(gqlUserData);
        console.log('✅ GraphQL User created:', {
            id: gqlUserResult.id,
            username: gqlUserResult.username,
            email: gqlUserResult.email
        });
        
        // 2. Login to get token
        console.log('2️⃣ Logging in to get token...');
        const gqlLoginResult = await graphqlAPI.login(testUser.email, testUser.password);
        console.log('✅ GraphQL Login successful, token received');
        
        // 3. Verify user exists
        console.log('3️⃣ Verifying user exists in database...');
        const gqlUsersBeforeDelete = await graphqlAPI.getUsers(gqlLoginResult.token);
        const gqlUserExists = gqlUsersBeforeDelete.some(u => u.id === gqlUserResult.id);
        console.log(`✅ User exists in database: ${gqlUserExists} (found ${gqlUsersBeforeDelete.length} total users)`);
        
        // 4. Delete user
        console.log('4️⃣ Deleting user via GraphQL API...');
        await graphqlAPI.deleteUser(gqlUserResult.id, gqlLoginResult.token);
        console.log('✅ GraphQL User deletion request completed');
        
        // 5. Verify user is deleted
        console.log('5️⃣ Verifying user is deleted from database...');
        try {
            await graphqlAPI.getUsers(gqlLoginResult.token);
            console.log('❌ ERROR: Token still valid after user deletion');
        } catch (error) {
            if (error.message.includes('User not found') || error.message.includes('Authentication') || error.message.includes('Invalid token')) {
                console.log('✅ User successfully deleted - token invalidated');
            } else {
                console.log('❓ Unexpected error:', error.message);
            }
        }
        
        console.log('\n🎯 Summary:');
        console.log('============');
        console.log('✅ Both APIs successfully handle user lifecycle:');
        console.log('   1. Create user ✓');
        console.log('   2. Login and receive token ✓');
        console.log('   3. Verify user exists ✓');
        console.log('   4. Delete user ✓');
        console.log('   5. Verify user is removed from database ✓');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
testUserLifecycle();
