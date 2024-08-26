import { describe, expect, test, jest, mock, afterEach } from "bun:test"
import { screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import { YourGroups } from "@/components/groups/components/myGroups";
import {mockGroup, mockGroup2, mockProposals} from "@/tests/mock";
import {renderWithChainProvider} from "@/tests/render";

// Mock useRouter
const m = jest.fn()
mock.module('next/router', () => ({
  useRouter: m.mockReturnValue({
    query: {},
    push: jest.fn(),
  })
}))

const mockOnSelectGroup = jest.fn();

function renderWithProps(props = {}) {
  const defaultProps = {
    groups: { groups: [mockGroup, mockGroup2] },
    groupByMemberDataLoading: false,
    groupByMemberDataError: null,
    refetchGroupByMember: jest.fn(),
    onSelectGroup: mockOnSelectGroup,
    proposals: mockProposals,
  };

  return renderWithChainProvider(<YourGroups {...defaultProps} {...props} />);
}

describe("YourGroups Component", () => {
  afterEach(cleanup)

  test("renders empty group state correctly", () => {
    renderWithProps({groups: { groups: []}});
    expect(screen.getByText("My Groups")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    expect(screen.getByText("No groups found")).toBeInTheDocument();
  });

  test("renders loading state correctly", () => {
    renderWithProps();
    expect(screen.getByText("My Groups")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search...")).toBeInTheDocument();
    expect(screen.getByText("title1")).toBeInTheDocument();
    expect(screen.getByText("title2")).toBeInTheDocument();
  });


  test("search functionality works correctly", () => {
    renderWithProps();

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "title1" } });

    expect(screen.getByText("title1")).toBeInTheDocument();
    expect(screen.queryByText("title2")).not.toBeInTheDocument();
  });

  test("group selection works correctly", async () => {
    mockOnSelectGroup.mockClear()

    renderWithProps();
    const group1 = screen.getByText("title1");
    fireEvent.click(group1);
    await waitFor(() => expect(mockOnSelectGroup).toHaveBeenLastCalledWith("test_policy_address"));
  });
});
