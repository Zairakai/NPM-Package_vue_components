# Makefile
# Delegates to @zairakai/js-dev-tools for quality and testing.

NPM_DIRECTORY_TOOLS_PROJECT_NAME := "vue-components"
DEV_TOOLS_NPM := node_modules/@zairakai/js-dev-tools

include $(DEV_TOOLS_NPM)/tools/make/core.mk
