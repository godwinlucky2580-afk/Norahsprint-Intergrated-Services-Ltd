# Projects Module - Admin Dashboard Implementation

## Steps

### Phase 1: HTML Changes (admin.html)

- [x] Step 1: Add Projects nav link in sidebar (below Products)
- [x] Step 2: Add Projects topbar section (hidden by default)
- [x] Step 3: Add Projects management panel HTML (hidden by default)

### Phase 2: JS Changes (admin.js)

- [x] Step 4: Add section wrapper IDs to Products content for route switching
- [x] Step 5: Implement sidebar routing (show/hide Products vs Projects)
- [x] Step 6: Add `fetchProjects()` - Supabase query for projects
- [x] Step 7: Add `fetchProjectCategories()`, `fetchProjectStatuses()`, `fetchProjectYears()` - filter data
- [x] Step 8: Add `projectRowHtml()` - row renderer matching Products pattern
- [x] Step 9: Add `refreshProjectsTable()` - load + render + search + filter
- [x] Step 10: Wire up search, filter, and refresh logic
- [x] Step 11: Wire up Actions (View → project-details.html)

### Phase 3: Testing

- [ ] Verify admin loads without errors
- [ ] Verify Projects nav item appears below Products
- [ ] Verify clicking Projects shows Projects Management view
- [ ] Verify clicking Products shows Products Management view
- [ ] Verify search and filters work
- [ ] Verify responsive behavior
